<script lang="ts">
	import { toast } from '$lib/stores/toast.svelte';
	import { loadBook_detail, unfoldBook, type BookDetail } from '$lib/api/book';
	import { showcase } from '$lib/stores/showcase.svelte';
	import Icon from '$components/Common/Icon.svelte';
	import BookMeta from './BookMeta.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Book } from '$lib/types';

	let { book, onClose }: { book: Book; onClose: () => void } = $props();

	let book_detail = $state<BookDetail | null>(null);
	let selectedPoint = $state<string>('1');
	// 뒤로가기 = 모달 1개 히스토리 entry로 취급 (Android 백버튼/웹 백, 2026-10-27)
	let navigating = false;
	let consumed = false;

	onMount(() => {
		handlebookPreview();
		history.pushState({ bookPreview: true }, '');
		window.addEventListener('popstate', onPop);
		return () => {
			window.removeEventListener('popstate', onPop);
			// X/오버레이 닫힘 시 남긴 entry 정리 (팝 발생 시·goto 전환 중이면 제외 — 이중 back 방지)
			if (!consumed && !navigating) history.back();
		};
	});

	function onPop() {
		// 백버튼(히스토리 팝) = 모달 닫기 — consumed로 cleanup의 이중 back() 차단
		consumed = true;
		onClose();
	}

	async function handlebookPreview() {
		try {
			book_detail = await loadBook_detail(book.id);
		} catch {
			toast.error('생성에 실패했어요');
		}
	}

	async function handleStart() {
		try {
			const result = await unfoldBook(book.id, selectedPoint);
			navigating = true;
			goto(`/book/${result.table_id}`);
		} catch {
			toast.error('생성에 실패했어요');
		}
	}
</script>

<div class="modal-overlay" role="presentation" onclick={onClose}>
	<div class="modal" role="presentation" onclick={(e) => e.stopPropagation()}>
		<div class="modal-header">
			<h3 class="modal-title">{showcase.text(book.title)}</h3>
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
						<pre class="content-text">{showcase.text(book.content)}</pre>
					</div>
				{:else}
					<div class="preview-placeholder">
						<span class="preview-icon"><Icon name="book-open" size={48} /></span>
					</div>
				{/if}
			</div>

			<BookMeta desc={showcase.text(book_detail?.desc ?? '')} createdAt={book.createdAt} />
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
		background: var(--color-scrim);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: var(--z-panel);
		padding: var(--space-md);
		animation: fadeIn 0.15s ease-out;
	}

	.modal {
		background: var(--color-bg-secondary);
		border-radius: var(--radius-lg);
		animation: popIn 0.18s ease-out;
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
		font-size: var(--font-size-lg);
		cursor: pointer;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	@media (hover: hover) {
		.close-btn:hover {
			background: var(--color-bg-tertiary);
			color: var(--color-text-primary);
		}
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

	@media (hover: hover) {
		.selector-dropdown:hover {
			border-color: var(--color-accent-primary);
		}
	}

	.selector-dropdown:focus {
		outline: none;
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px var(--color-accent-glow);
	}

	.book-preview {
		width: 100%;
		aspect-ratio: 16 / 9;
		background: transparent;
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
		background: transparent;
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
		font-family: var(--font-mono);
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
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	@media (hover: hover) {
		.start-btn:hover {
			background: var(--color-accent-secondary);
			transform: translateY(-1px);
		}
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
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes popIn {
		from {
			opacity: 0;
			transform: scale(0.94);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
