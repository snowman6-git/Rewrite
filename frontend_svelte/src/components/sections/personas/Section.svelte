<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import InputField from '$components/Common/InputField.svelte';
	import InputGroup from '$components/Common/InputGroup.svelte';
	import Icon from '$components/Common/Icon.svelte';
	import Modal from '$components/Common/Modal.svelte';

	type PersonaImage = { id: string; dataUrl: string; name: string };
	type Persona = { id: string; name: string; images: PersonaImage[] };

	const LS = 'rewrite_personas';
	function load(): Persona[] {
		try {
			return JSON.parse(localStorage.getItem(LS) ?? '[]');
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
	let draftImages = $state<PersonaImage[]>([]);
	let delTarget: Persona | null = $state(null);
	let fileEl: HTMLInputElement;

	function openAdd() {
		draftName = '';
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
		const next = [...list, { id: crypto.randomUUID(), name: draftName.trim(), images: draftImages }];
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

<div class="personas-section">
	<div class="section-head">
		<h2 class="section-title">페르소나</h2>
		<button class="add-btn" onclick={openAdd}>
			<Icon name="plus" size={16} />
			추가
		</button>
	</div>

	{#if list.length === 0}
		<div class="empty">
			<p class="empty-text">페르소나 없음</p>
			<button class="empty-add" onclick={openAdd}>
				<Icon name="plus" size={16} />
				추가
			</button>
		</div>
	{:else}
		<div class="card-list">
			{#each list as p (p.id)}
				<div class="card">
					{#if p.images[0]}
						<img class="card-img" src={p.images[0].dataUrl} alt="{p.name}" />
					{:else}
						<div class="card-img ph"><Icon name="user" size={22} /></div>
					{/if}
					<div class="card-main">
						<span class="card-name">{p.name}</span>
						<span class="card-meta">{p.images.length > 0 ? p.images.length + '개 이미지' : '이미지 없음'}</span>
					</div>
					<button class="card-x" onclick={() => askDelete(p)} aria-label="{p.name} 삭제">×</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if open}
	<div class="sheet-overlay" role="presentation" onclick={close}></div>
	<div
		class="add-sheet"
		role="dialog"
		aria-label="페르소나 추가"
		in:fly={{ y: 120, duration: 250, easing: cubicOut }}
		out:fly={{ y: 120, duration: 250, easing: cubicOut }}
	>
		<div class="sheet-head">
			<span class="sheet-title">페르소나 추가</span>
			<button class="sheet-x" onclick={close} aria-label="닫기">×</button>
		</div>
		<div class="sheet-body">
			<InputGroup label="이름" for="persona-name-add">
				<InputField id="persona-name-add" bind:value={draftName} placeholder="페르소나 이름" />
			</InputGroup>

			<div class="img-zone">
				<div class="img-head">
					<span class="img-label">이미지</span>
					<span class="img-opt">선택</span>
				</div>
				{#each draftImages as img, k (img.id)}
					<div class="img-row">
						<img class="img-thumb" src={img.dataUrl} alt={img.name || '이미지 ' + (k + 1)} />
						<input
							class="img-name"
							bind:value={img.name}
							placeholder="이미지 이름 (필수)"
							aria-label="이미지 이름"
						/>
						<button class="img-x" onclick={() => removeImage(img.id)} aria-label="이미지 제거">×</button>
					</div>
				{/each}
				<button class="img-add" onclick={() => fileEl?.click()}>
					<Icon name="plus" size={16} />
					이미지 선택
				</button>
				<input
					type="file"
					bind:this={fileEl}
					accept="image/*"
					multiple
					class="file-hidden"
					onchange={(e: Event) => addImages((e.target as HTMLInputElement).files)}
				/>
			</div>
		</div>
		<div class="sheet-foot">
			<button class="sheet-confirm" disabled={!canSave} onclick={savePersona}>추가</button>
		</div>
	</div>
{/if}

{#if delTarget}
	<Modal
		title="페르소나 삭제"
		message="{delTarget.name}을(를) 삭제할까요?"
		variant="danger"
		confirmText="삭제"
		onConfirm={deletePersona}
		onCancel={() => (delTarget = null)}
	/>
{/if}

<style>
	.personas-section {
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		min-height: 100%;
	}

	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.section-title {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.add-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		min-height: 26px;
		padding: 0 var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.add-btn:hover {
		border-color: var(--color-accent-primary);
	}

	/*빈 상태*/
	.empty {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-sm);
		min-height: 12rem;
	}

	.empty-text {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
	}

	.empty-add {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2xs);
		min-height: 26px;
		padding: 0 var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		cursor: pointer;
	}

	/*카드 목록*/
	.card-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.card {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-secondary);
	}

	.card-img {
		width: 56px;
		height: 56px;
		border-radius: var(--radius-sm);
		object-fit: cover;
		border: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.card-img.ph {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-elevated);
		color: var(--color-text-tertiary);
	}

	.card-main {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.card-name {
		font-size: var(--font-size-base);
		font-weight: 500;
		color: var(--color-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-meta {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}

	.card-x {
		flex-shrink: 0;
		width: 26px;
		height: 26px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-tertiary);
		font-size: var(--font-size-lg);
		line-height: 1;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.card-x:hover {
		color: var(--color-error);
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
	}

	/*추가 하단 시트*/
	.sheet-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 998;
		backdrop-filter: blur(2px);
	}

	.add-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 999;
		display: flex;
		flex-direction: column;
		max-height: 80dvh;
		background: var(--color-bg-tertiary);
		border: 0.15rem solid var(--color-accent-primary);
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		border-bottom: none;
		overflow: hidden;
	}

	.sheet-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-sm) var(--space-md);
		border-bottom: 1px solid var(--color-border);
	}

	.sheet-title {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.sheet-x {
		width: 26px;
		height: 26px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: var(--font-size-xl);
		line-height: 1;
		cursor: pointer;
	}

	.sheet-body {
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		overflow-y: auto;
	}

	/*이미지 구역*/
	.img-zone {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.img-head {
		display: flex;
		align-items: center;
		gap: var(--space-2xs);
	}

	.img-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.img-opt {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}

	.img-row {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.img-thumb {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-sm);
		object-fit: cover;
		border: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.img-name {
		flex: 1;
		min-width: 0;
		min-height: 26px;
		padding: 0 var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
	}

	.img-name:focus {
		outline: none;
		border-color: var(--color-accent-primary);
	}

	.img-x {
		flex-shrink: 0;
		width: 26px;
		height: 26px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-tertiary);
		font-size: var(--font-size-lg);
		line-height: 1;
		cursor: pointer;
	}

	.img-x:hover {
		color: var(--color-error);
	}

	.img-add {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2xs);
		min-height: 26px;
		padding: var(--space-2xs) var(--space-sm);
		align-self: flex-start;
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.img-add:hover {
		border-color: var(--color-accent-primary);
		color: var(--color-text-primary);
	}

	.file-hidden {
		display: none;
	}

	.sheet-foot {
		padding: var(--space-sm) var(--space-md) calc(var(--space-sm) + env(safe-area-inset-bottom));
		border-top: 1px solid var(--color-border);
	}

	.sheet-confirm {
		width: 100%;
		min-height: 2.25rem;
		border: none;
		border-radius: var(--radius-sm);
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
		font-size: var(--font-size-base);
		font-weight: 500;
		cursor: pointer;
		transition: opacity var(--transition-fast);
	}

	.sheet-confirm:disabled {
		opacity: 0.35;
		cursor: default;
	}

	@media (max-width: 480px) {
		.personas-section {
			padding: var(--space-sm);
		}
	}
</style>
