<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import InputField from '$components/Common/InputField.svelte';
	import InputGroup from '$components/Common/InputGroup.svelte';
	import Icon from '$components/Common/Icon.svelte';
	import Modal from '$components/Common/Modal.svelte';

	type PersonaImage = { id: string; dataUrl: string; name: string };
	type Persona = { id: string; name: string; setting: string; images: PersonaImage[] };

	type RawImage = { id?: unknown; name?: unknown; dataUrl?: unknown };
	type RawPersona = { id?: unknown; name?: unknown; setting?: unknown; images?: RawImage[] };

	const LS = 'rewrite_personas';
	function load(): Persona[] {
		try {
			return (JSON.parse(localStorage.getItem(LS) ?? '[]') as RawPersona[]).map((c) => ({
				id: String(c.id ?? ''),
				name: String(c.name ?? ''),
				setting: String(c.setting ?? ''),
				images: Array.isArray(c.images)
					? c.images.map((i: RawImage) => ({
							id: String(i.id ?? ''),
							name: String(i.name ?? ''),
							dataUrl: String(i.dataUrl ?? '')
						}))
					: []
			}));
		} catch {
			return [];
		}
	}
	function save(list: Persona[]) {
		localStorage.setItem(LS, JSON.stringify(list));
	}

	let list = $state<Persona[]>(load());
	let open = $state(false);
	let draftName = $state('');
	let draftSetting = $state('');
	let draftImages = $state<PersonaImage[]>([]);
	let delTarget: Persona | null = $state(null);
	let fileEl: HTMLInputElement;

	function openAdd() {
		draftName = '';
		draftSetting = '';
		draftImages = [];
		open = true;
	}
	function close() {
		open = false;
	}

	const canSave = $derived(draftName.trim() !== '' && draftImages.every((i) => i.name.trim() !== ''));

	function addImages(files: FileList | null) {
		if (!files) return;
		for (const f of [...files]) {
			if (!f.type.startsWith('image/')) continue;
			const r = new FileReader();
			r.onload = () => {
				draftImages = [...draftImages, { id: crypto.randomUUID(), dataUrl: String(r.result), name: '' }];
			};
			r.readAsDataURL(f);
		}
		if (fileEl) fileEl.value = ''; //같은 파일 재선택 가능
	}
	function removeImage(id: string) {
		draftImages = draftImages.filter((i) => i.id !== id);
	}
	function savePersona() {
		if (!canSave) return;
		const next = [...list, { id: crypto.randomUUID(), name: draftName.trim(), setting: draftSetting, images: draftImages }];
		list = next;
		save(next);
		close();
	}
	function askDelete(p: Persona) {
		delTarget = p;
	}
	function deletePersona() {
		const t = delTarget;
		if (!t) return;
		const next = list.filter((p) => p.id !== t.id);
		list = next;
		save(next);
		delTarget = null;
	}
</script>

<div class="characters-section">
	<div class="section-head">
		<h2 class="section-title">등장인물</h2>
		<button class="add-btn" onclick={openAdd} aria-label="등장인물 추가" title="등장인물 추가">+</button>
	</div>

	{#if list.length === 0}
		<p class="empty-text">등장인물 없음</p>
	{:else}
		<div class="char-list">
			{#each list as p (p.id)}
				<div class="char-card">
					{#if p.images[0]?.dataUrl}
						<img class="cover" src={p.images[0].dataUrl} alt="{p.name}" />
					{:else}
						<span class="cover placeholder"><Icon name="user" size={22} /></span>
					{/if}
					<div class="char-body">
						<p class="char-name">{p.name}</p>
						<p class="char-meta">{p.images.length > 0 ? `${p.images.length}개 이미지` : '이미지 없음'}</p>
					</div>
					<button class="del-btn" onclick={() => askDelete(p)} aria-label="{p.name} 삭제">
						<Icon name="x" size={16} />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if open}
	<div class="sheet-overlay" role="dialog" aria-label="등장인물 추가" aria-modal="true" onclick={close}></div>
	<div class="sheet" transition:fly={{ y: 120, duration: 250, easing: cubicOut }}>
		<div class="sheet-head">
			<span class="sheet-title">등장인물 추가</span>
			<button class="sheet-close" onclick={close} aria-label="닫기">
				<Icon name="x" size={18} />
			</button>
		</div>

		<InputGroup label="이름" for="persona-name-add">
			<InputField id="persona-name-add" class="persona-tall" bind:value={draftName} placeholder="등장인물 이름" />
		</InputGroup>

		<InputGroup label="설정" for="persona-setting-add">
			<InputField id="persona-setting-add" type="textarea" bind:value={draftSetting} placeholder="성격, 말투, 행동 원칙 등" rows="5" />
		</InputGroup>

		<div class="img-zone">
			<input
				bind:this={fileEl}
				type="file"
				accept="image/*"
				multiple
				class="file-hidden"
				onchange={(e: Event) => addImages((e.target as HTMLInputElement).files)}
			/>
			<button class="add-img-btn" onclick={() => fileEl?.click()}>
				<Icon name="plus" size={16} /> 이미지 추가
			</button>
			{#each draftImages as img (img.id)}
				<div class="img-row">
					<img class="img-thumb" src={img.dataUrl} alt="{img.name || '미命名的 이미지'}" />
					<input
						class="img-name"
						type="text"
						bind:value={img.name}
						placeholder="이미지 이름 (필수)"
						aria-label="이미지 이름"
					/>
					<button class="img-del" onclick={() => removeImage(img.id)} aria-label="이미지 제거">×</button>
				</div>
			{/each}
		</div>

		<div class="sheet-foot">
			<button class="btn-cancel" onclick={close}>취소</button>
			<button class="btn-save" onclick={savePersona} disabled={!canSave}>저장</button>
		</div>
	</div>
{/if}

{#if delTarget}
	{@const del = delTarget}
	<Modal
		title="등장인물 삭제"
		message="{del.name}을(를) 삭제합니다."
		variant="danger"
		confirmText="삭제"
		cancelText="취소"
		onConfirm={deletePersona}
		onCancel={() => (delTarget = null)}
	/>
{/if}

<style>
	.characters-section {
		padding: var(--space-lg);
		max-width: 900px;
		width: 100%;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		min-height: 100%;
		box-sizing: border-box;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.add-btn {
		width: 2.25rem;
		height: 2.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		font-size: var(--font-size-base);
		cursor: pointer;
		transition: border-color var(--transition-fast), color var(--transition-fast);
	}

	.add-btn:hover {
		border-color: var(--color-text-tertiary);
		color: var(--color-text-primary);
	}

	.char-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.char-card {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-secondary);
	}

	.cover {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: var(--radius-sm);
		object-fit: cover;
		flex-shrink: 0;
	}

	.cover.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border);
		background: var(--color-bg-tertiary);
		color: var(--color-text-tertiary);
	}

	.char-body {
		flex: 1;
		min-width: 0;
	}

	.char-name {
		margin: 0;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.char-meta {
		margin: 2px 0 0;
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}

	.del-btn {
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-tertiary);
		cursor: pointer;
		transition: background var(--transition-fast), color var(--transition-fast);
	}

	.del-btn:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.empty-text {
		margin: var(--space-xl) 0;
		text-align: center;
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
	}

	.sheet-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 998;
	}

	.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		background: var(--color-bg-secondary);
		border-top: 1px solid var(--color-border);
		border-radius: var(--radius-md) var(--radius-md) 0 0;
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		max-height: 80dvh;
		overflow-y: auto;
	}

	.sheet-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.sheet-title {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.sheet-close {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.img-zone {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.file-hidden {
		display: none;
	}

	.add-img-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		padding: var(--space-sm);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: border-color var(--transition-fast), color var(--transition-fast);
	}

	.add-img-btn:hover {
		border-color: var(--color-text-tertiary);
		color: var(--color-text-primary);
	}

	.img-row {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.img-thumb {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--radius-xs, var(--radius-sm));
		object-fit: cover;
		border: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.img-name {
		flex: 1;
		min-width: 0;
		min-height: 36px;
		padding: var(--space-2xs, var(--space-xs)) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		outline: none;
	}

	.img-name:focus {
		border-color: var(--color-accent-primary);
	}

	.img-del {
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--color-text-tertiary);
		font-size: var(--font-size-base);
		cursor: pointer;
	}

	.img-del:hover {
		color: var(--color-text-primary);
	}

	.sheet-foot {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-xs);
	}

	.btn-cancel {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		cursor: pointer;
	}

	.btn-save {
		padding: var(--space-xs) var(--space-md);
		border: none;
		border-radius: var(--radius-sm);
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
	}

	.btn-save:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	:global(.input-field.persona-tall) {
		padding-top: var(--space-md);
		padding-bottom: var(--space-md);
	}

	@media (max-width: 768px) {
		.characters-section {
			padding: var(--space-md);
		}
	}
</style>
