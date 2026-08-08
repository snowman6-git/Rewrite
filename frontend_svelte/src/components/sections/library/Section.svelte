<script lang="ts">
	import Modal from '$components/Common/Modal.svelte';
	import ContextMenu from '$components/Common/ContextMenu.svelte';

	interface DeskBook {
		id: number;
		title: string;
		lastLine: string;
		label: string;
	}

	let { books = [] }: { books?: DeskBook[] } = $props();

	// 임시 데이터
	const sampleBooks: DeskBook[] = [
		{
			id: 1,
			title: '테스트',
			lastLine: '자리에 앉자 나를 맞이한건 수백 수십개의 버그였다',
			label: '기술'
		},
		{ id: 2, title: 'AI', lastLine: '나는 오늘도 그날을 후회한다 AI에게 고맙다고 인사하지않은걸...', label: '역사' },
	];

	let contextMenu = $state<{ x: number; y: number; book: DeskBook | null }>({
		x: 0,
		y: 0,
		book: null
	});

	let confirmDeleteBook = $state<DeskBook | null>(null);

	const booksData = $derived(books.length > 0 ? books : sampleBooks);

	function showContextMenu(e: MouseEvent, book: DeskBook) {
		e.preventDefault();
		contextMenu = { x: e.clientX, y: e.clientY, book };
	}

	function hideContextMenu() {
		contextMenu = { x: 0, y: 0, book: null };
	}

	function handleDeleteFromMenu() {
		if (!contextMenu.book) return;
		confirmDeleteBook = contextMenu.book;
		hideContextMenu();
	}

	function handleInfoFromMenu() {
		// TODO: 정보 보기 구현
		console.log('Info:', contextMenu.book?.id);
		hideContextMenu();
	}

	function handleConfirmDelete() {
		if (!confirmDeleteBook) return;
		console.log('Delete:', confirmDeleteBook.id);
		confirmDeleteBook = null;
	}

	function handleCancelDelete() {
		confirmDeleteBook = null;
	}

	let menuItems = $derived.by(() => {
		if (!contextMenu.book) return [];
		return [
			{ label: '삭제', icon: '🗑️', onClick: handleDeleteFromMenu },
			{ label: '정보 보기', icon: 'ℹ️', onClick: handleInfoFromMenu, disabled: true }
		];
	});
</script>

<div class="desk-section">
	<!-- Grid -->
	<div class="desk-grid">
		{#each booksData as book (book.id)}
			<div
				class="desk-card"
				onclick={() => {
					/* TODO: 열기 */
				}}
				oncontextmenu={(e) => showContextMenu(e, book)}
			>
				<h3 class="card-title">{book.title}</h3>
				<p class="card-last-line">"{book.lastLine}"</p>
				<span class="card-label">{book.label}</span>
			</div>
		{/each}
	</div>

	<!-- Empty State -->
	{#if booksData.length === 0}
		<div class="empty-state">
			<p class="empty-icon">🖊️</p>
			<p class="empty-text">서재에 책이 없습니다</p>
		</div>
	{/if}

	<!-- Context Menu -->
	<ContextMenu items={menuItems} {...contextMenu} onClose={hideContextMenu} />

	<!-- Delete Confirmation Modal -->
	{#if confirmDeleteBook}
		<Modal
			title="삭제 확인"
			message="{confirmDeleteBook.title} 책을 삭제하시겠습니까?"
			variant="danger"
			confirmText="삭제"
			cancelText="취소"
			onConfirm={handleConfirmDelete}
			onCancel={handleCancelDelete}
		/>
	{/if}
</div>

<style>
	.desk-section {
		width: 100%;
		padding: var(--space-lg);
		max-width: 1400px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.desk-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--space-md);
	}

	.desk-card {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		overflow: hidden;
		transition: all var(--transition-base);
		border: 1px solid var(--color-border);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		position: relative;
		cursor: pointer;
		user-select: none;
	}

	.desk-card:hover {
		box-shadow: var(--shadow-md);
		border-color: var(--color-accent-primary);
	}

	.card-title {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.3;
	}

	.card-last-line {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.4;
		font-style: italic;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-label {
		font-size: 0.7rem;
		padding: 2px 8px;
		background: var(--color-bg-elevated);
		border-radius: var(--radius-full);
		color: var(--color-text-tertiary);
		align-self: flex-start;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-3xl) var(--space-md);
		text-align: center;
		gap: var(--space-sm);
	}

	.empty-icon {
		font-size: 3rem;
		opacity: 0.5;
	}

	.empty-text {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
		margin: 0;
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.desk-section {
			padding: var(--space-md);
			gap: var(--space-md);
		}

		.desk-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
