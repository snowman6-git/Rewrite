<script lang="ts">
	let { label, icon, active = false, onClick }: {
		label: string;
		icon: string;
		active?: boolean;
		onClick?: () => void;
	} = $props();
</script>

<button class="nav-item" class:active={active} onclick={onClick}>
	<span class="nav-icon">{icon}</span>
	<span class="nav-label">{label}</span>
</button>

<style>
	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
		text-align: left;
		font-size: var(--font-size-sm);
	}

	.nav-item:hover {
		background: var(--color-bg-elevated);
		color: var(--color-text-primary);
	}

	.nav-item.active {
		background: var(--color-accent-primary);
		color: white;
	}

	.nav-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.nav-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	@media (max-width: 768px) {
		.nav-item {
			width: auto;
			flex-shrink: 0;
		}
	}

	@media (max-width: 480px) {
		.nav-item {
			padding: var(--space-2xs) var(--space-sm);
			font-size: var(--font-size-xs);
		}

		.nav-icon {
			font-size: 1rem;
		}
	}
</style>
