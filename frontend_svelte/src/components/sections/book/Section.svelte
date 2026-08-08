<script lang="ts">
	import UploadModal from '$components/Common/UploadModal.svelte';
	import ToastContainer from '$components/Common/ToastContainer.svelte';
	import BookCard from '$components/sections/book/BookCard.svelte';
	import BookPreview from '$components/sections/book/BookPreview.svelte';
	import { uploadFiles, loadBooks } from '$lib/api/book';
	import { toast } from '$lib/stores/toast.svelte';

	interface Book {
		id: number;
		title: string;
		desc: string;
		author: string;
		category: string;
		usageCount: number;
		createdAt: string;
		content?: string;
	}

	let { books = [] }: { books?: Book[] } = $props();

	let searchQuery = $state('');
	let sortBy = $state<'popular' | 'usage' | 'created'>('popular');
	let filteredBooks = $state<Book[]>([]);
	let uploadInput = $state<HTMLInputElement>();
	let tomlUploadInput = $state<HTMLInputElement>();
	let showUploadModal = $state(false);
	let loaded = $state(false);
	let selectedBook = $state<Book | null>(null);

	function handleSearch(event: Event) {
		searchQuery = (event.target as HTMLInputElement).value;
	}

	function handleSort(event: Event) {
		sortBy = (event.target as HTMLButtonElement).dataset.sort as typeof sortBy;
	}

	// async function handleUploadZip(event: Event) {
	// 	const input = event.target as HTMLInputElement;
	// 	if (!input.files || input.files.length === 0) return;

	// 	try {
	// 		const result = await uploadFiles([input.files[0]], 'zip');
	// 		toast.success(`${result.count} 권의 책이 추가되었습니다.`);
	// 	} catch (error) {
	// 		console.error('ZIP 업로드 오류:', error);
	// 		toast.error('업로드 실패: ' + (error as Error).message);
	// 	}
	// }

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
					book.author.toLowerCase().includes(query) ||
					book.category.toLowerCase().includes(query)
			);
		}

		switch (sortBy) {
			case 'usage':
				result.sort((a, b) => b.usageCount - a.usageCount);
				break;
			case 'created':
				result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
				break;
			case 'popular':
				result.sort((a, b) => b.usageCount - a.usageCount);
				break;
		}

		filteredBooks = result;
	});
</script>

<div class="book-section">
	<ToastContainer />

	<!-- Search & Sort -->
	<div class="controls">
		<div class="search-container">
			<input
				type="text"
				class="search-input"
				placeholder="이어서 쓰기"
				oninput={handleSearch}
				aria-label="검색"
			/>
		</div>

		<div class="head-tools">
			<div class="sort-buttons">
				<button
					class="sort-btn"
					class:active={sortBy === 'popular'}
					data-sort="popular"
					onclick={handleSort}
				>
					<span class="icon">🔥</span>
					인기
				</button>
				<button
					class="sort-btn"
					class:active={sortBy === 'usage'}
					data-sort="usage"
					onclick={handleSort}
				>
					<span class="icon">📖</span>
					활성화
				</button>
				<button
					class="sort-btn"
					class:active={sortBy === 'created'}
					data-sort="created"
					onclick={handleSort}
				>
					<span class="icon">📅</span>
					추가일자
				</button>
			</div>

			<!-- Upload Buttons -->
			<div class="upload-group">
				<button
					class="upload-btn"
					onclick={() => (showUploadModal = true)}
					aria-label="책 업로드"
					title="책 업로드"
				>
					<span class="icon">+</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Grid -->
	<div class="book-grid">
		{#each filteredBooks as book (book.id)}
			<BookCard {book} onClick={(b) => (selectedBook = b)} />
		{/each}
	</div>

	<!-- Empty State -->
	{#if filteredBooks.length === 0}
		<div class="empty-state">
			<p class="empty-icon">📚</p>
			<p class="empty-text">
				{searchQuery ? '검색 결과가 없습니다' : '아직 책이 없습니다'}
			</p>
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
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);
		align-items: center;
		justify-content: space-between;
		flex-direction: row-reverse;
	}

	.search-container {
		position: relative;
		flex: 1;
		min-width: 250px;
		max-width: 400px;
	}

	.search-input {
		width: 100%;
		padding: var(--space-sm) var(--space-lg) var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		transition: all var(--transition-fast);
		outline: none;
		margin-bottom: 1rem;
	}

	.search-input:focus {
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 3px var(--color-accent-primary-opacity);
	}

	.search-input::placeholder {
		color: var(--color-text-tertiary);
	}
	.head-tools {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.sort-buttons {
		height: 2rem;
		display: flex;
		gap: var(--space-2xs);
		padding: var(--space-lg) var(--space-4xl);
		border-radius: var(--radius-lg);
		border: 2px solid var(--color-border);
		max-width: fit-content;
	}
	.sort-btn {
		height: 100%;
		padding: var(--space-lg) var(--space-4xl);
		border: 2px solid transparent;
		background: transparent;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		font-weight: 500;
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all var(--transition-base);
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: var(--space-2xs);
	}

	.sort-btn .icon {
		font-size: 0.85em;
	}

	.sort-btn:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-tertiary);
	}

	.sort-btn.active {
		color: var(--color-text-primary);
		background: var(--color-bg-elevated);
		border-color: var(--color-accent-primary);
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
	}

	.upload-group {
		display: flex;
		gap: var(--space-2xs);
		align-items: center;
	}

	.upload-btn {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-size: 0.9rem;
	}

	.upload-btn:hover {
		background: var(--color-bg-tertiary);
		border-color: var(--color-accent-primary);
		color: var(--color-text-primary);
	}

	.upload-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		font-size: 1.5rem;
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.upload-btn:hover {
		border-color: var(--color-accent-primary);
		color: var(--color-accent-primary);
		background: var(--color-bg-tertiary);
	}

	.book-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-md);
		overflow-y: scroll;
		-webkit-overflow-scrolling: touch;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-3xl) var(--space-md);
		text-align: center;
		gap: var(--space-sm);
		height: 100%;
		width: 100%;
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

	.empty-hint {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
		margin: 0;
	}

	@media (max-width: 1200px) {
		.book-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (max-width: 768px) {
		.book-section {
			padding: var(--space-md);
			gap: var(--space-md);
		}
		.controls {
			flex-direction: column;
			align-items: stretch;
		}

		.search-container {
			max-width: 100%;
		}

		.sort-buttons {
		}

		.book-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-sm);
		}

		.book-cover {
			aspect-ratio: 3 / 4;
		}

		.book-emoji {
			font-size: 2rem;
		}

		.book-info {
			padding: var(--space-sm);
			gap: var(--space-2xs);
		}

		.book-title {
			font-size: 0.75rem;
		}

		.book-author {
			font-size: 0.65rem;
		}

		.book-category {
			font-size: 0.6rem;
			padding: 1px 4px;
		}

		.book-meta {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.book-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.book-cover {
			aspect-ratio: 2 / 3;
		}

		.book-emoji {
			font-size: 1.5rem;
		}

		.sort-buttons {
			flex-wrap: wrap;
		}

		.sort-btn {
			font-size: 0.65rem;
			padding: 4px 8px;
		}
	}
</style>
