<script lang="ts">
	import Icon from '$components/Common/Icon.svelte';
	import { longPress } from '$lib/longpress';
	import type { Book } from '$lib/types';

	let { book, onClick, onContext }: {
		book: Book;
		onClick?: (book: Book) => void;
		onContext?: (x: number, y: number, book: Book) => void;
	} = $props();

	const lp = longPress((x, y) => onContext?.(x, y, book));
</script>

<!--책 판매 사이트 패턴: 표지(이미지 슬롯) → 제목 → 작가-->
<div
		class="book-card"
		role="button"
		tabindex={0}
		onclick={() => {
			if (lp.consume()) return;
			onClick?.(book);
		}}
		oncontextmenu={(e) => {
			e.preventDefault();
			e.stopPropagation();
			onContext?.(e.clientX, e.clientY, book);
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') onClick?.(book);
		}}
		ontouchstart={lp.ontouchstart}
		ontouchmove={lp.ontouchmove}
		ontouchend={lp.ontouchend}
		ontouchcancel={lp.ontouchcancel}
	>
	<div class="book-cover">
		<span class="cover-stack"><Icon name="book-stack" size={48} /></span>
	</div>
	<div class="book-info">
		<h3 class="book-title">{book.title}</h3>
		{#if book.author}<p class="book-author">{book.author}</p>{/if}
	</div>
</div>

<style>
	.book-card {
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		transition: border-color var(--transition-fast);
		user-select: none;
		-webkit-touch-callout: none;
	}

	.book-card:hover {
		border-color: var(--color-accent-primary);
	}

	/* 표지 = 향후 실제 사진 슬롯. 3:4(실제 책 비율) */
	.book-cover {
		position: relative;
		width: 100%;
		aspect-ratio: 3 / 4;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			135deg,
			var(--color-bg-elevated) 0%,
			var(--color-bg-secondary) 100%
		);
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
	}

	.book-title {
		font-size: var(--font-size-xs);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.4;
		display: -webkit-box;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.book-author {
		font-size: 0.7rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.4;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
