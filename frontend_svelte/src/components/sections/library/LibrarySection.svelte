<script lang="ts">
	import Modal from '$components/Common/Modal.svelte';
	import Icon from '$components/Common/Icon.svelte';
	import { goto } from '$app/navigation';
	import ContextMenu from '$components/Common/ContextMenu.svelte';
	import Btn from '$components/Common/Btn.svelte';
	import { useBookMenu } from '$lib/useBookMenu.svelte';

	interface DeskBook {
		id: string;
		title: string;
		lastLine: string;
		label: string;
		bookId?: string;
	}

	interface LibrarySectionProps {
		books: DeskBook[];
		isLoading?: boolean;
		isError?: boolean;
		errorMessage?: string;
		onDelete?: (book: DeskBook) => void;
		onRefresh?: () => void;
	}

	let {
		books = [],
		isLoading = false,
		isError = false,
		errorMessage = '',
		onDelete,
		onRefresh
	}: LibrarySectionProps = $props();

	// 컨텍스트메뉴(우클릭)·모바일 롱프레스·삭제 확인 — 책장(sections/book/Section)과 공유
	const {
		menu,
		hide: hideContextMenu,
		show: showContextMenu,
		lp: deskLp
	} = useBookMenu<DeskBook>();

	// — 풀투리프레시(모바일): scrollTop 0에서 아래로 당겨 새로고침 —
	let pull = $state(0);
	let p2pSpin = $state(false);
	let p2pStartY = 0;
	let p2pActive = $state(false);

	function p2pTouchStart(e: TouchEvent) {
		const scroller = document.querySelector('.app-main') as HTMLElement | null;
		if ((scroller?.scrollTop ?? 0) === 0) {
			p2pActive = true;
			p2pStartY = e.touches[0].clientY;
		}
	}
	function p2pTouchMove(e: TouchEvent) {
		if (!p2pActive || p2pSpin) return;
		const dy = e.touches[0].clientY - p2pStartY;
		if (dy > 0) {
			e.preventDefault();
			pull = Math.min(dy * 0.5, 80);
		}
	}
	function p2pEnd() {
		if (!p2pActive) return;
		p2pActive = false;
		if (pull >= 60 && onRefresh) {
			p2pSpin = true;
			pull = 56;
			Promise.resolve(onRefresh()).finally(() => {
				p2pSpin = false;
				pull = 0;
			});
		} else {
			pull = 0;
		}
	}
	function handleInfoFromMenu() {
		// TODO: 정보 보기 구현
		hideContextMenu();
	}

	function handleConfirmDelete() {
		if (!menu.confirm || !onDelete) return;
		onDelete(menu.confirm);
		menu.confirm = null;
	}

	function handleCancelDelete() {
		menu.confirm = null;
	}

	let menuItems = $derived.by(() => {
		if (!menu.book) return [];
		const b = menu.book;
		return [
			{ label: '정보 보기', icon: 'book', onClick: handleInfoFromMenu, disabled: true },
			{ separator: true },
			{ label: '삭제', icon: 'trash', danger: true, onClick: () => (menu.confirm = b) }
		];
	});
</script>

<div
	class="library-section"
	role="region"
	aria-label="서재"
	ontouchstart={p2pTouchStart}
	ontouchmove={p2pTouchMove}
	ontouchend={p2pEnd}
>
	<div
		class="p2p"
		class:hidden={pull === 0}
		class:anim={!p2pActive}
		class:p2p-spin={p2pSpin}
		style={`height: ${pull}px`}
	>
		<div
			class="p2p-indicator"
			style={`transform: rotate(${pull * 2.25}deg); opacity: ${Math.min(pull / 40, 1)}`}
		>
			<Icon name="refresh" size={22} />
		</div>
	</div>
	<!-- 헤더: 타이틀 + 개수 + 리프레시 (항상 노출 — 개수는 데이터와 함께 갱신) -->
	<div class="lib-header">
		<h2 class="lib-title">서재 <span class="lib-count">{books.length}</span></h2>
		{#if onRefresh}
			<button class="refresh-btn" onclick={onRefresh} aria-label="새로고침" title="새로고침"
				>↻</button
			>
		{/if}
	</div>

	<!-- 로딩 상태 -->
	{#if isLoading}
		<div class="center-state">
			<p class="state-text">서재를 불러오는 중...</p>
		</div>
	{/if}

	<!-- 에러 상태 -->
	{#if isError}
		<div class="center-state">
			<p class="state-text">{errorMessage}</p>
			{#if onRefresh}
				<Btn variant="save" onclick={onRefresh}>다시 시도</Btn>
			{/if}
		</div>
	{/if}

	<!-- 책 목록 -->
	{#if !isLoading && !isError}
		<div class="desk-list">
			{#each books as book (book.id)}
				<div
					class="desk-item"
					role="button"
					tabindex={0}
					onclick={() => {
						if (deskLp.consume()) return;
						goto(`/book/${book.id}`);
					}}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							void goto(`/book/${book.id}`);
						}
					}}
					oncontextmenu={(e) => showContextMenu(e, book)}
					ontouchstart={(e) => {
						menu.lp = book;
						deskLp.ontouchstart(e);
					}}
					ontouchmove={deskLp.ontouchmove}
					ontouchend={deskLp.ontouchend}
					ontouchcancel={deskLp.ontouchcancel}
				>
					<div class="item-content">
						<div class="item-top">
							<h3 class="item-title">{book.title}</h3>
							{#if book.label}
								<span class="item-label">{book.label}</span>
							{/if}
						</div>
						{#if book.lastLine}
							<p class="item-last-line">{book.lastLine}</p>
						{/if}
					</div>
					<span class="item-arrow">›</span>
				</div>
			{/each}
		</div>

		<!-- Empty State -->
		{#if books.length === 0}
			<div class="center-state">
				<p class="state-text">서재에 책이 없습니다</p>
			</div>
		{/if}
	{/if}

	<!-- Context Menu -->
	<ContextMenu items={menuItems} x={menu.x} y={menu.y} onClose={hideContextMenu} />

	<!-- Delete Confirmation Modal -->
	{#if menu.confirm}
		<Modal
			title="삭제 확인"
			message="{menu.confirm.title} 책을 삭제하시겠습니까?"
			variant="danger"
			confirmText="삭제"
			cancelText="취소"
			onConfirm={handleConfirmDelete}
			onCancel={handleCancelDelete}
		/>
	{/if}
</div>

<style>
	.library-section {
		width: 100%;
		padding: var(--space-lg);
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.p2p {
		overflow: hidden;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		color: var(--color-text-tertiary);
		flex-shrink: 0;
	}

	.p2p.hidden {
		display: none;
	}

	.p2p.anim {
		transition: height 0.25s ease;
	}

	.p2p-spin .p2p-indicator {
		animation: p2p-rot 0.8s linear infinite;
	}

	@keyframes p2p-rot {
		to {
			transform: rotate(360deg);
		}
	}
	.lib-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.lib-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.lib-count {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-tertiary);
	}

	.refresh-btn {
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

	@media (hover: hover) {
		.refresh-btn:hover {
			border-color: var(--color-accent-primary);
			color: var(--color-text-primary);
		}
	}

	.desk-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.desk-item {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-sm) var(--space-md);
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		cursor: pointer;
		transition: border-color var(--transition-fast);
		user-select: none;
	}

	@media (hover: hover) {
		.desk-item:hover {
			border-color: var(--color-accent-primary);
		}
	}

	.item-content {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.item-top {
		display: flex;
		align-items: baseline;
		gap: var(--space-xs);
		min-width: 0;
	}

	.item-title {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.item-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		flex-shrink: 0;
	}

	.item-last-line {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		margin: 0;
		line-height: 1.4;
		display: -webkit-box;
		line-clamp: 2;
		line-clamp: 2;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.item-arrow {
		font-size: var(--font-size-lg);
		color: var(--color-text-tertiary);
		font-weight: 300;
		flex-shrink: 0;
	}

	.center-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-2xl) var(--space-md);
		text-align: center;
		gap: var(--space-sm);
	}

	.state-text {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: 0;
	}

	@media (max-width: 768px) {
		.library-section {
			padding: var(--space-md);
		}
		.desk-item {
			padding: var(--space-sm);
		}
	}
</style>
