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

	let { book, onClose }: { book: Book; onClose: () => void } = $props();
</script>

<div class="modal-overlay" onclick={onClose}>
	<div class="modal" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h3 class="modal-title">{book.title}</h3>
			<button class="close-btn" onclick={onClose} aria-label="닫기">✕</button>
		</div>

		<div class="modal-content">
			<div class="book-preview">
				<div class="preview-placeholder">
					<span class="preview-emoji">📖</span>
				</div>
			</div>

			<div class="book-details">
				<div class="book-info-section">
					<h4 class="section-label">소개</h4>
					<p class="book-desc">{book.desc}</p>
				</div>

				<div class="book-meta-section">
					<div class="book-meta-info">
						<span class="meta-tag">👤 {book.author}</span>
						<span class="meta-tag">📂 {book.category}</span>
						<span class="meta-tag">📊 {book.usageCount} 회</span>
					</div>
					<p class="book-created">
						📅 {new Date(book.createdAt).toLocaleDateString('ko-KR')}
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-md);
	}

	.modal {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		max-width: 900px;
		width: 100%;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-xl);
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.modal-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.close-btn {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		font-size: 1.2rem;
		cursor: pointer;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.close-btn:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.modal-content {
		padding: var(--space-lg);
		overflow-y: auto;
	}

	.book-preview {
		width: 100%;
		aspect-ratio: 16 / 9;
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--space-lg);
		overflow: hidden;
	}

	.preview-placeholder {
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

	.preview-emoji {
		font-size: 4rem;
		opacity: 0.5;
	}

	.book-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.book-info-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.section-label {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.book-desc {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		line-height: 1.8;
		margin: 0;
		padding: var(--space-sm);
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
	}

	.book-meta-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding-top: var(--space-sm);
		border-top: 1px solid var(--color-border);
	}

	.book-meta-info {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.meta-tag {
		font-size: 0.75rem;
		padding: var(--space-2xs) var(--space-xs);
		background: var(--color-bg-elevated);
		border-radius: var(--radius-xs);
		color: var(--color-text-secondary);
	}

	.book-created {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		margin: 0;
	}

	/* 모바일: 100% 높이/넓이 */
	@media (max-width: 768px) {
		.modal-overlay {
			padding: 0;
		}

		.modal {
			max-width: 100%;
			max-height: 100%;
			height: 100vh;
			border-radius: 0;
		}

		.modal-content {
			flex: 1;
			overflow-y: auto;
		}

		.book-preview {
			aspect-ratio: 16 / 9;
			height: auto;
		}
	}
</style>
