<script lang="ts">
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

	let { book, onClick }: { book: Book; onClick?: (book: Book) => void } = $props();

	function handleClick() {
		onClick?.(book);
	}
</script>

<div class="book-card" onclick={handleClick}>
	<div class="book-cover">
		<div class="cover-placeholder">
			<span class="book-emoji">📖</span>
		</div>
	</div>
	<div class="book-info">
		<h3 class="book-title">{book.title}</h3>
		<p class="book-author">{book.desc}</p>
		<p class="book-author">{book.author}</p>
		<span class="book-category">{book.category}</span>
		<div class="book-meta">
			<span class="meta-item">
				<span class="meta-icon">📊</span>
				<span>{book.usageCount} 회</span>
			</span>
			<span class="meta-item">
				<span class="meta-icon">📅</span>
				<span>{new Date(book.createdAt).toLocaleDateString('ko-KR')}</span>
			</span>
		</div>
	</div>
</div>

<style>
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
</style>
