<script lang="ts">
	import UploadModal from '$components/Common/UploadModal.svelte';
	import ToastContainer from '$components/Common/ToastContainer.svelte';
	import ContextMenu from '$components/Common/ContextMenu.svelte';
	import Modal from '$components/Common/Modal.svelte';
	import BookCard from '$components/sections/book/BookCard.svelte';
	import BookPreview from '$components/sections/book/BookPreview.svelte';
	import { uploadFiles, loadBooks, deleteBookshelf, renameBook } from '$lib/api/book';
	import { toast } from '$lib/stores/toast.svelte';
	import type { Book } from '$lib/types';

	let { books = [] }: { books?: Book[] } = $props();

	let searchQuery = $state('');
	let sortBy = $state<'popular' | 'usage' | 'created'>('popular');
	let filteredBooks = $state<Book[]>([]);
	let uploadInput = $state<HTMLInputElement>();
	let tomlUploadInput = $state<HTMLInputElement>();
	let showUploadModal = $state(false);
	let loaded = $state(false);
	let selectedBook = $state<Book | null>(null);
	let ctxMenu = $state<{ x: number; y: number; book: Book | null }>({ x: 0, y: 0, book: null });
	let confirmDeleteBook = $state<Book | null>(null);
	let renameBookTarget = $state<Book | null>(null);
	let renameValue = $state('');

	function showContextMenu(x: number, y: number, book: Book) {
		ctxMenu = { x, y, book };
	}

	function hideContextMenu() {
		ctxMenu = { x: 0, y: 0, book: null };
	}

	let menuItems = $derived.by(() => {
		if (!ctxMenu.book) return [];
		const b = ctxMenu.book;
		return [
			{ label: '정보 보기', onClick: () => (selectedBook = b) },
			{ label: '제목 변경', onClick: () => (renameValue = b.title, (renameBookTarget = b)) },
			{ label: '삭제', danger: true, onClick: () => (confirmDeleteBook = b) }
		];
	});

	async function handleRenameBook(book: Book, title: string) {
		try {
			await renameBook(book.id, title);
			toast.success('제목이 변경되었습니다.');
			books = books.map((b) => (b.id === book.id ? { ...b, title } : b));
		} catch (error) {
			toast.error(
				error instanceof Error && error.message ? error.message : '제목 변경에 실패했습니다.'
			);
		}
	}

	async function handleDeleteBook(book: Book) {
		try {
			await deleteBookshelf(book.id);
			toast.success('책이 삭제되었습니다.');
			books = books.filter((b) => b.id !== book.id);
		} catch (error) {
			toast.error(
				error instanceof Error && error.message ? error.message : '삭제에 실패했습니다.'
			);
		}
	}

	function handleSearch(event: Event) {
		searchQuery = (event.target as HTMLInputElement).value;
	}

	function handleSort(event: Event) {
		sortBy = (event.target as HTMLButtonElement).dataset.sort as typeof sortBy;
	}

	async function handleUploadZip(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		try {
			const result = await uploadFiles([input.files[0]], 'zip');
			toast.success(`${result.count} 권의 책이 추가되었습니다.`);
		} catch (error) {
			console.error('ZIP 업로드 오류:', error);
			toast.error('업로드 실패: ' + (error as Error).message);
		}
	}

	async function handleUploadToml(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		try {
			const result = await uploadFiles(Array.from(input.files), 'toml');
			toast.success(`${result.books} 가 추가되었습니다.`);
		} catch (error) {
			console.error('TOML 업로드 오류:', error);
			toast.error('업로드 실패: ' + (error as Error).message);
		}
	}

	$effect(() => {
		if (books.length === 0 && !loaded) {
			loaded = true;
			loadBooks()
				.then((loadedBooks) => {
					books = loadedBooks;
				})
				.catch((error) => {
					console.error('[Section] 책 로드 실패:', error);
				});
		}
	});

	$effect(() => {
		const allBooks = books.length > 0 ? books : [];
		let result = [...allBooks];
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(book) =>
					book.title.toLowerCase().includes(query) ||
					(book.author ?? '').toLowerCase().includes(query) ||
					(book.category ?? '').toLowerCase().includes(query)
			);
		}

		switch (sortBy) {
			case 'usage':
				result.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0));
				break;
			case 'created':
				result.sort(
					(a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
				);
				break;
			case 'popular':
				result.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0));
				break;
		}

		filteredBooks = result;
	});
</script>

<div class="book-section">
	<ToastContainer />

	<!-- 컨트롤: 검색 + 정렬 + 업로드 -->
	<div class="controls">
		<input
			type="text"
			class="search-input"
			placeholder="이어서 쓰기"
			oninput={handleSearch}
			aria-label="검색"
		/>

		<div class="tools">
			<div class="sort-buttons">
				<button class="sort-btn" class:active={sortBy === 'popular'} data-sort="popular"
					onclick={handleSort}>인기</button
				>
				<button class="sort-btn" class:active={sortBy === 'usage'} data-sort="usage"
					onclick={handleSort}>활성화</button
				>
				<button class="sort-btn" class:active={sortBy === 'created'} data-sort="created"
					onclick={handleSort}>추가일자</button
				>
			</div>

			<button
				class="upload-btn"
				onclick={() => (showUploadModal = true)}
				aria-label="책 업로드"
				title="책 업로드">+</button
			>
		</div>
	</div>

	<!-- Grid -->
	<div class="book-grid">
		{#each filteredBooks as book (book.id)}
			<BookCard
				{book}
				onClick={(b) => (selectedBook = b)}
				onContext={(x, y, b) => showContextMenu(x, y, b)}
			/>
		{/each}
	</div>

	<!-- Empty State -->
	{#if filteredBooks.length === 0}
		<div class="empty-state">
			<p class="empty-text">{searchQuery ? '검색 결과가 없습니다' : '아직 책이 없습니다'}</p>
			<p class="empty-hint">
				{searchQuery ? '다른 키워드로 검색해보세요' : '새로운 책을 추가해보세요'}
			</p>
		</div>
	{/if}

	{#if showUploadModal}
		<UploadModal
			onUploadZip={() => {
				showUploadModal = false;
				uploadInput?.click();
			}}
			onUploadToml={() => {
				showUploadModal = false;
				tomlUploadInput?.click();
			}}
			onCancel={() => (showUploadModal = false)}
		/>
	{/if}

	{#if selectedBook}
		<BookPreview book={selectedBook} onClose={() => (selectedBook = null)} />
	{/if}

	<!-- Context Menu -->
	<ContextMenu items={menuItems} {...ctxMenu} onClose={hideContextMenu} />

	<!-- Delete Confirmation Modal -->
	{#if confirmDeleteBook}
		<Modal
			title="삭제 확인"
			message="{confirmDeleteBook.title} 책을 삭제하시겠습니까?"
			variant="danger"
			confirmText="삭제"
			cancelText="취소"
			onConfirm={() => {
				const b = confirmDeleteBook;
				confirmDeleteBook = null;
				if (b) handleDeleteBook(b);
			}}
			onCancel={() => (confirmDeleteBook = null)}
		/>
	{/if}

	<!-- Rename Modal -->
	{#if renameBookTarget}
		<Modal
			title="제목 변경"
			message="{renameBookTarget.title}의 제목을 변경합니다."
			inputValue={renameValue}
			inputPlaceholder="새 제목"
			onConfirm={(v) => {
				const b = renameBookTarget;
				renameBookTarget = null;
				if (b && v) handleRenameBook(b, v);
			}}
			onCancel={() => (renameBookTarget = null)}
		/>
	{/if}

	<!-- Hidden file inputs -->
	<input
		type="file"
		class="upload-input"
		accept=".zip"
		multiple={false}
		onchange={handleUploadZip}
		hidden
		bind:this={uploadInput}
	/>
	<input
		type="file"
		class="upload-input"
		accept=".toml"
		multiple={true}
		onchange={handleUploadToml}
		hidden
		bind:this={tomlUploadInput}
	/>
</div>

<style>
	.book-section {
		padding: var(--space-lg);
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: center;
	}

	.search-input {
		flex: 1;
		min-width: 200px;
		max-width: 320px;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		outline: none;
		transition: border-color var(--transition-fast);
	}

	.search-input:focus {
		border-color: var(--color-accent-primary);
	}

	.search-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.tools {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.sort-buttons {
		display: flex;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		overflow: hidden;
	}

	.sort-btn {
		padding: var(--space-xs) var(--space-sm);
		border: none;
		background: transparent;
		color: var(--color-text-tertiary);
		font-size: var(--font-size-xs);
		cursor: pointer;
		white-space: nowrap;
		transition:
			color var(--transition-fast),
			background var(--transition-fast);
	}

	.sort-btn + .sort-btn {
		border-left: 1px solid var(--color-border);
	}

	.sort-btn.active {
		background: var(--color-bg-elevated);
		color: var(--color-text-primary);
	}

	.upload-btn {
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

	.upload-btn:hover {
		border-color: var(--color-accent-primary);
		color: var(--color-text-primary);
	}

	.book-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-md);
		align-content: start;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	@media (max-width: 768px) {
		.book-section {
			padding: var(--space-md);
		}
		.tools {
			margin-left: 0;
			width: 100%;
			justify-content: space-between;
		}
		.book-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-sm);
		}
	}

	@media (max-width: 480px) {
		.book-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-xs);
		}
	}
</style>
