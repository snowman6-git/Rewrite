<script lang="ts">
	import Desc from '$components/Common/Desc.svelte';
	import EmptyState from '$components/Common/EmptyState.svelte';
	import { bookmarkState } from '$lib/states/bookmarks.svelte';
	import { chatState } from '$lib/states/chat.svelte';
	import { pageState } from '$lib/states/menus.svelte';

	function go(pid: string) {
		chatState.jumpPid = pid;
		// 햄메뉴가 채팅을 덮고 있으므로 점프하면 닫아야 대상이 보인다
		pageState.isHammenu_open = false;
	}
</script>

<div class="bookmark-view view-container">
	<Desc>책갈피한 대화로 이동합니다. 버블 메뉴에서 추가합니다.</Desc>

	{#if bookmarkState.list.length === 0}
		<EmptyState text="책갈피 없음" hint="채팅 버블의 ⋯ 메뉴에서 추가해줘" />
	{:else}
		<ul class="bm-list">
			{#each bookmarkState.list as bm (bm.pid)}
				<li class="bm-row">
					<button class="bm-jump" onclick={() => go(bm.pid)}>
						<span class="bm-snippet">{bm.snippet}</span>
						<span class="bm-time">
							{new Date(bm.at).toLocaleDateString('ko-KR')}
						</span>
					</button>
					<button class="bm-remove" onclick={() => bookmarkState.remove(bm.pid)} aria-label="삭제">
						삭제
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.bm-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.bm-row {
		display: flex;
		align-items: stretch;
		gap: var(--space-2xs);
	}

	.bm-jump {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		padding: var(--space-sm);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		text-align: left;
		cursor: pointer;
	}

	.bm-snippet {
		font-size: var(--font-size-sm);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.bm-time {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		font-variant-numeric: tabular-nums;
	}

	.bm-remove {
		flex-shrink: 0;
		padding: 0 var(--space-sm);
		background: transparent;
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		color: var(--color-text-tertiary);
		font-size: var(--font-size-xs);
		cursor: pointer;
	}

	@media (hover: hover) {
		.bm-jump:hover,
		.bm-remove:hover {
			border-color: var(--color-accent-primary);
		}
	}
</style>
