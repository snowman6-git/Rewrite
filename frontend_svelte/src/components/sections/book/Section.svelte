<script lang="ts">
	interface Book {
		id: number;
		title: string;
		author: string;
		category: string;
		usageCount: number;
		createdAt: string;
	}

	let { books = [] }: { books?: Book[] } = $props();

	let searchQuery = $state('');
	let sortBy = $state<'popular' | 'usage' | 'created'>('popular');
	let filteredBooks = $state<Book[]>([]);
	let uploadInput = $state<HTMLInputElement>();

	function handleSearch(event: Event) {
		searchQuery = (event.target as HTMLInputElement).value;
	}

	function handleSort(event: Event) {
		sortBy = (event.target as HTMLButtonElement).dataset.sort as typeof sortBy;
	}

	async function handleUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];
		if (!file.name.endsWith('.zip')) {
			alert('ZIP 파일만 업로드 가능합니다.');
			return;
		}

		// TODO: ZIP 파일 파싱 및 책 데이터 추출
		console.log('Upload ZIP:', file.name);
		alert('ZIP 파일 업로드 기능 준비 중입니다.');
	}

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

			<!-- Upload Button -->
			<input
				type="file"
				class="upload-input"
				accept=".zip"
				multiple={false}
				onchange={handleUpload}
				hidden
				bind:this={uploadInput}
			/>
			<button class="upload-btn" onclick={() => uploadInput?.click()} aria-label="책 업로드">
				<span class="icon">+</span>
			</button>
		</div>
	</div>

	<!-- Grid -->
	<div class="book-grid">
		{#each filteredBooks as book (book.id)}
			<div class="book-card">
				<div class="book-cover">
					<div class="cover-placeholder">
						<span class="book-emoji">📖</span>
					</div>
				</div>
				<div class="book-info">
					<h3 class="book-title">{book.title}</h3>
					<p class="book-author">{book.author}</p>
					<span class="book-category">{book.category}</span>
					<div class="book-meta">
						<span class="meta-item">
							<span class="meta-icon">📊</span>
							<span>{book.usageCount}회</span>
						</span>
						<span class="meta-item">
							<span class="meta-icon">📅</span>
							<span>{new Date(book.createdAt).toLocaleDateString('ko-KR')}</span>
						</span>
					</div>
				</div>
			</div>
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

	.book-card {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		overflow: hidden;
		transition: all var(--transition-base);
		border: 1px solid var(--color-border);
		cursor: pointer;
		min-height: 280px;
		display: flex;
		flex-direction: column;
	}

	.book-card:hover {
		box-shadow: var(--shadow-md);
		border-color: var(--color-accent-primary);
	}

	.book-cover {
		position: relative;
		width: 100%;
		aspect-ratio: 3 / 4;
		overflow: hidden;
		background: var(--color-bg-elevated);
	}

	.cover-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			135deg,
			var(--color-bg-elevated) 0%,
			var(--color-bg-secondary) 100%
		);
	}

	.book-emoji {
		font-size: 3rem;
		opacity: 0.5;
	}

	.book-info {
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.book-title {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.4;
		padding: var(--space-2xs) 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.book-author {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.4;
		padding: var(--space-2xs) 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.book-category {
		font-size: 0.65rem;
		padding: var(--space-2xs) var(--space-xs);
		background: var(--color-bg-elevated);
		border-radius: var(--radius-xs);
		color: var(--color-text-tertiary);
		align-self: flex-start;
	}

	.book-meta {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin-top: var(--space-2xs);
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 2px;
		font-size: 0.65rem;
		color: var(--color-text-tertiary);
	}

	.meta-icon {
		font-size: 0.7rem;
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
