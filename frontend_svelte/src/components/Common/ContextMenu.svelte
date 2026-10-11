<script lang="ts">
	import Icon from '$components/Common/Icon.svelte';

	interface MenuItem {
		label?: string;
		icon?: string; // Icon.svelte의 icons/controls 키 (테마 규칙: 이모지 금지)
		onClick?: () => void;
		disabled?: boolean;
		danger?: boolean;
		separator?: boolean;
	}

	interface Props {
		items: MenuItem[];
		x: number;
		y: number;
		onClose: () => void;
	}

	let { items, x, y, onClose }: Props = $props();
	let menuEl = $state<HTMLDivElement | null>(null);

	// 뷰포트 클램프 — bind:this가 $state라 엘리먼트 마운트 시 효과 재실행
	$effect(() => {
		const el = menuEl;
		if (!el) return;
		const M = 8;
		// offsetWidth/Height — 진입 애니메이션(scale 0.95)에 영향받지 않는 레이아웃 크기 (rect는 0.95배로 측정돼 우측 1px 넘침)
		el.style.left = `${Math.max(M, Math.min(x, window.innerWidth - el.offsetWidth - M))}px`;
		el.style.top = `${Math.max(M, Math.min(y, window.innerHeight - el.offsetHeight - M))}px`;
	});

	function handleContextMenu(e: MouseEvent) {
		e.preventDefault();
		onClose();
	}

	function handleClick(e: MouseEvent) {
		if (e.target && !(e.target as Element).closest('.context-menu')) {
			onClose();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onClose();
		}
	}

	$effect(() => {
		document.addEventListener('contextmenu', handleContextMenu);
		document.addEventListener('click', handleClick);
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('contextmenu', handleContextMenu);
			document.removeEventListener('click', handleClick);
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if items.length > 0}
	<div class="context-menu" bind:this={menuEl}>
		{#each items as item (item.label)}
			{#if item.separator}
				<div class="context-menu-separator"></div>
			{:else}
				<button
					class="context-menu-item"
					class:disabled={item.disabled}
					onclick={() => {
						item.onClick?.();
						onClose();
					}}
				>
					{#if item.icon}
						<span class="menu-icon"><Icon name={item.icon} size={16} /></span>
					{/if}
					<span class="menu-label" class:danger={item.danger}>{item.label}</span>
				</button>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.context-menu {
		position: fixed;
		z-index: 9999;
		min-width: 180px;
		padding: var(--space-xs);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
		animation: menu-appear 0.15s ease-out;
	}

	@keyframes menu-appear {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.context-menu-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: none;
		background: transparent;
		color: var(--color-text-primary);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
		font-size: var(--font-size-sm);
		text-align: left;
	}

	@media (hover: hover) {
		.context-menu-item:hover:not(.disabled) {
			background: var(--color-bg-elevated);
			color: var(--color-accent-primary);
		}
	}

	.menu-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		flex-shrink: 0;
	}

	.menu-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.menu-label.danger {
		/* 모노크롬 테마: 네온 빨강은 튀므로 중립색으로 뺌 — 인식은 분리선+하단 위치가 담당 */
		color: color-mix(in srgb, var(--color-error) 65%, var(--color-text-tertiary));
	}

	.context-menu-separator {
		height: 1px;
		background: var(--color-border);
		margin: var(--space-xs) 0;
	}
</style>
