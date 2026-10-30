<script lang="ts">
	import Icon from '$components/Common/Icon.svelte';
	import { showcase } from '$lib/stores/showcase.svelte';
	import type { Book } from '$lib/types';

	let { book, onClick }: { book: Book; onClick?: (book: Book) => void } = $props();

	function handleClick() {
		onClick?.(book);
	}
</script>

<!--책 판매 사이트 패턴: 표지(이미지 슬롯) → 제목 → 작가-->
<div
	class="book-card"
	role="button"
	tabindex={0}
	onclick={handleClick}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') handleClick();
	}}
>
	<div class="book-cover">
		<span class="cover-stack"><Icon name="book" size={48} /></span>
	</div>
	<div class="book-info">
		<h3 class="book-title">{showcase.text(book.title)}</h3>
		{#if book.author}<p class="book-author">{showcase.text(book.author)}</p>{/if}
	</div>
</div>

<style>
	.book-card {
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		overflow: hidden;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		transition: border-color var(--transition-fast);
	}

	@media (hover: hover) {
		.book-card:hover {
			border-color: var(--color-accent-primary);
		}
	}

	/* 표지 = 향후 실제 사진 슬롯. 3:4(실제 책 비율) — 원고지 시안(2026-10-27)과 동일: 평면 배경+스파인+내부 프레임 */
	.book-cover {
		position: relative;
		width: 100%;
		aspect-ratio: 3 / 4;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-elevated);
	}

	/* 왼쪽 스파인(6px) */
	.book-cover::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 6px;
		background: rgba(0, 0, 0, 0.28);
	}

	/* 내부 프레임(인셋 8px) */
	.book-cover::after {
		content: '';
		position: absolute;
		inset: 8px;
		border: 1px solid rgba(128, 128, 128, 0.18);
		pointer-events: none;
	}

	.cover-stack {
		color: var(--color-text-tertiary);
		opacity: 0.5;
	}

	.book-info {
		padding: var(--space-sm);
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-top: 1px solid var(--color-border);
	}

	.book-title {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.book-author {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.4;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
