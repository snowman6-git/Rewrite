<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';
	import { addCharacter, deleteCharacter, listCharacters, updateCharacter } from '$lib/api/character';
	import type { Persona, PersonaImage } from '$lib/personas';
	import { mapCharacterRow } from '$lib/personas';
	import { toast } from '$lib/stores/toast.svelte';
	import InputField from '$components/Common/InputField.svelte';
	import InputGroup from '$components/Common/InputGroup.svelte';
	import Icon from '$components/Common/Icon.svelte';
	import EmptyState from '$components/Common/EmptyState.svelte';
	import Modal from '$components/Common/Modal.svelte';
	import Sheet from '$components/Common/Sheet.svelte';
	import { onMount } from 'svelte';

	let list = $state<Persona[]>([]);
	let open = $state(false);
	let editTarget = $state<Persona | null>(null);
	let draftName = $state('');
	let draftLore = $state('');
	let draftImages = $state<PersonaImage[]>([]);
	let delTarget: Persona | null = $state(null);
	let fileEl = $state<HTMLInputElement | undefined>();

	// 원천 = API (2026-10-30 LS 전환) — DB row(c_id·c_name·c_lore) → Persona 매핑, images는 컬럼 미구현까지 빈 배열
	onMount(async () => {
		try {
			const rows = await listCharacters();
			list = rows.map(mapCharacterRow);
		} catch {
			toast.error('등장인물 불러오기 실패');
		}
	});

	function openAdd() {
		editTarget = null;
		draftName = '';
		draftLore = '';
		draftImages = [];
		open = true;
	}
	function openEdit(p: Persona) {
		editTarget = p;
		draftName = p.name;
		draftLore = p.lore;
		draftImages = [...p.images];
		open = true;
	}
	function close() {
		open = false;
		editTarget = null;
	}

	const canSave = $derived(
		draftName.trim() !== '' && draftImages.every((i) => i.name.trim() !== '')
	);

	function addImages(files: FileList | null) {
		if (!files) return;
		for (const f of [...files]) {
			if (!f.type.startsWith('image/')) continue;
			const r = new FileReader();
			r.onload = () => {
				// crypto.randomUUID는 secure context 전용 — LAN 평문 http에서 undefined
				draftImages = [...draftImages, { id: uuidv4(), dataUrl: String(r.result), name: '' }];
			};
			r.readAsDataURL(f);
		}
		if (fileEl) fileEl.value = ''; //같은 파일 재선택 가능
	}
	function removeImage(id: string) {
		draftImages = draftImages.filter((i) => i.id !== id);
	}
	async function savePersona() {
		if (!canSave) return;
		// 원천 = API (추가 POST·수정 PATCH) — 계약: doc/character-doc.md
		const payload = {
			name: draftName.trim(),
			lore: draftLore,
			images: draftImages.map((i) => ({ name: i.name.trim(), data: i.dataUrl }))
		};
		try {
			if (editTarget) {
				const t = editTarget; // 클로저에서 narrowing 유지용
				await updateCharacter(t.id, payload);
				list = list.map((x) =>
					x.id === t.id
						? { ...x, name: payload.name, lore: payload.lore, images: draftImages }
						: x
				);
				toast.success('등장인물 수정됨');
				close();
				return;
			}
			const res = await addCharacter(payload);
			// 서버가 c_id를 주면 그걸로, 아직 안 주면 로컬 id로
			const id = typeof res.c_id === 'string' ? res.c_id : uuidv4();
			list = [...list, { id, name: payload.name, lore: payload.lore, images: draftImages }];
			toast.success('등장인물 저장됨');
			close();
		} catch {
			toast.error('저장 실패 — 백엔드 반응이 없어요');
		}
	}
	function askDelete(p: Persona) {
		delTarget = p;
	}
	async function deletePersona() {
		const t = delTarget;
		if (!t) return;
		try {
			await deleteCharacter(t.id);
			list = list.filter((p) => p.id !== t.id);
			toast.success('등장인물 삭제됨');
		} catch {
			toast.error('삭제 실패 — 백엔드 DELETE 미반영');
		}
		delTarget = null;
	}
</script>

<div class="characters-section">
	<div class="section-head">
		<h2 class="section-title">등장인물</h2>
		<button class="add-btn" onclick={openAdd} aria-label="등장인물 추가" title="등장인물 추가"
			>+</button
		>
	</div>

	{#if list.length === 0}
		<EmptyState text="등장인물 없음" />
	{:else}
		<div class="char-list">
			{#each list as p (p.id)}
				<div class="char-card" role="button" tabindex="0" onclick={() => openEdit(p)}
					onkeydown={(e) => e.key === 'Enter' && openEdit(p)}>
					{#if p.images[0]?.dataUrl}
						<img class="cover" src={p.images[0].dataUrl} alt={p.name} />
					{:else}
						<span class="cover placeholder"><Icon name="user" size={22} /></span>
					{/if}
					<div class="char-body">
						<p class="char-name">{p.name}</p>
						<p class="char-meta">
							{p.images.length > 0 ? `${p.images.length}개 이미지` : '이미지 없음'}
						</p>
					</div>
					<button class="del-btn" onclick={(e) => { e.stopPropagation(); askDelete(p); }}
						aria-label="{p.name} 삭제">
						<Icon name="x" size={16} />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if open}
	<Sheet onClose={close}>
		<div class="sheet-head">
			<span class="sheet-title">{editTarget ? '등장인물 수정' : '등장인물 추가'}</span>
			<button class="sheet-close" onclick={close} aria-label="닫기">
				<Icon name="x" size={18} />
			</button>
		</div>

		<InputGroup label="이름" for="persona-name-add">
			<InputField
				id="persona-name-add"
				class="persona-tall"
				bind:value={draftName}
				placeholder="등장인물 이름"
			/>
		</InputGroup>

		<InputGroup label="로어" for="persona-lore-add">
			<InputField
				id="persona-lore-add"
				type="textarea"
				bind:value={draftLore}
				placeholder="성격, 말투, 행동 원칙 등"
				rows="5"
			/>
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
					<img class="img-thumb" src={img.dataUrl} alt={img.name || '미命名的 이미지'} />
					<input
						class="img-name"
						type="text"
						bind:value={img.name}
						placeholder="이미지 이름 (필수)"
						aria-label="이미지 이름"
					/>
					<button class="img-del" onclick={() => removeImage(img.id)} aria-label="이미지 제거"
						>×</button
					>
				</div>
			{/each}
		</div>

		<div class="sheet-foot">
			<button class="btn-cancel" onclick={close}>취소</button>
			<button class="btn-save" onclick={savePersona} disabled={!canSave}>
				{editTarget ? '수정' : '저장'}
			</button>
		</div>
	</Sheet>
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
		flex: 1;
		min-width: 0;
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
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	@media (hover: hover) {
		.add-btn:hover {
			border-color: var(--color-text-tertiary);
			color: var(--color-text-primary);
		}
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
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	@media (hover: hover) {
		.del-btn:hover {
			background: var(--color-bg-tertiary);
			color: var(--color-text-primary);
		}
	}

	.sheet-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.sheet-title {
		font-size: var(--font-size-base);
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
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	@media (hover: hover) {
		.add-img-btn:hover {
			border-color: var(--color-text-tertiary);
			color: var(--color-text-primary);
		}
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

	@media (hover: hover) {
		.img-del:hover {
			color: var(--color-text-primary);
		}
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
