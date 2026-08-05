<script lang="ts">
	export interface MenuItem {
		label?: string;
		icon?: string;
		onClick?: () => void;
		disabled?: boolean;
		separator?: boolean;
	}

	interface Props {
		items: MenuItem[];
		x: number;
		y: number;
		onClose: () => void;
	}

	let { items, x, y, onClose }: Props = $props();

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
	<div class="context-menu" style="left: {x}px; top: {y}px;">
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
						<span class="menu-icon">{item.icon}</span>
					{/if}
					<span class="menu-label">{item.label}</span>
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
		box-shadow: var(--shadow-lg);
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

	.context-menu-item:hover:not(.disabled) {
		background: var(--color-bg-elevated);
		color: var(--color-accent-primary);
	}

	.context-menu-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.menu-icon {
		font-size: 1rem;
		width: 20px;
		text-align: center;
		flex-shrink: 0;
	}

	.menu-label {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.context-menu-separator {
		height: 1px;
		background: var(--color-border);
		margin: var(--space-xs) 0;
	}
</style>