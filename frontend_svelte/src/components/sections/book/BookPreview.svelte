<script lang="ts">
	import axios from 'axios';
	import { apiBase } from '$api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import ToastContainer from '$components/Common/ToastContainer.svelte';
	import Icon from '$components/Common/Icon.svelte';
	import BookMeta from './BookMeta.svelte';
	import { onMount } from 'svelte';
	import type { Book } from '$lib/types';

	let { book, onClose }: { book: Book; onClose: () => void } = $props();

	interface BookDetail {
		id?: string;
		desc?: string;
		starting?: { point_id: string; name: string }[];
	}

	let book_detail = $state<BookDetail | null>(null);
	let selectedPoint = $state<string>('1');

	onMount(() => {
		handlebookPreview();
	});

	async function handlebookPreview() {
		let loadBook_detail = await axios.get(`${apiBase()}/book_detail?id=${book.id}`, {
			withCredentials: true
		});
		if (loadBook_detail.status >= 200 && loadBook_detail.status < 300) {
			book_detail = loadBook_detail.data;
		} else {
			toast.error('생성에 실패했어요');
		}
	}

	async function handleStart() {
		let story_unfolds = await axios.post(
			`${apiBase()}/book_unfolds`,
			{
				book_id: book.id,
				point_id: selectedPoint
			},
			{
				withCredentials: true
			}
		);

		if (story_unfolds.status >= 200 && story_unfolds.status < 300) {
			window.location.href = `/book/${story_unfolds.data['table_id']}`;
		} else {
			toast.error('생성에 실패했어요');
		}

		// onClose();
	}
</script>

<ToastContainer />
<div class="modal-overlay" role="presentation" onclick={onClose}>
	<div class="modal" role="presentation" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h3 class="modal-title">{book.title}</h3>
			<button class="close-btn" onclick={onClose} aria-label="닫기">✕</button>
		</div>

		<div class="modal-content">
			<div class="starting-point-selector">
				<label class="selector-label" for="starting-point">시작 지점</label>
				<select class="selector-dropdown" id="starting-point" bind:value={selectedPoint}>
				{#each book_detail?.starting ?? [] as starting (starting.point_id)}
					<option value={starting.point_id}>{starting.name}</option>
				{/each}
				</select>
			</div>

			<div class="book-preview">
				{#if book.content}
					<div class="content-display">
						<pre class="content-text">{book.content}</pre>
					</div>
				{:else}
					<div class="preview-placeholder">
						<span class="preview-icon"><Icon name="book-open" size={48} /></span>
					</div>
				{/if}
			</div>

			<BookMeta
				desc={book_detail?.desc ?? ''}
				author={book.author}
				category={book.category}
				usageCount={book.usageCount}
				createdAt={book.createdAt}
			/>
		</div>

		<div class="modal-footer">
			<button class="start-btn" onclick={handleStart}> 시작하기 </button>
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
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.starting-point-selector {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.selector-label {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.selector-dropdown {
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.selector-dropdown:hover {
		border-color: var(--color-accent-primary);
	}

	.selector-dropdown:focus {
		outline: none;
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 3px var(--color-accent-glow);
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

	.preview-icon {
		display: inline-flex;
		color: var(--color-text-tertiary);
		opacity: 0.7;
	}

	.content-display {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.content-text {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-lg);
		font-family: var(--font-family-monospace);
		font-size: var(--font-size-sm);
		line-height: 1.8;
		color: var(--color-text-primary);
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}

	.modal-footer {
		padding: var(--space-md) var(--space-lg);
		border-top: 1px solid var(--color-border);
		display: flex;
		justify-content: flex-end;
	}

	.start-btn {
		padding: var(--space-sm) var(--space-2xl);
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.start-btn:hover {
		background: var(--color-accent-secondary);
		transform: translateY(-1px);
	}

	.start-btn:active {
		transform: translateY(0);
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
