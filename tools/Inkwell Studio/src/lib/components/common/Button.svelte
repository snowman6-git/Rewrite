<script lang="ts">
	let {
		children,
		class: className = '',
		variant = 'primary',
		disabled = false,
		onclick,
		...props
	} = $props<{
		children?: any;
		class?: string;
		variant?: 'primary' | 'secondary' | 'danger';
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
	}>();
</script>

<button
	class="ink-btn"
	class:primary={variant === 'primary'}
	class:secondary={variant === 'secondary'}
	class:danger={variant === 'danger'}
	class:disabled={disabled}
	class:list={className ? [className].filter(Boolean) : undefined}
	disabled={disabled}
	onclick={onclick}
>
	{@render children()}
</button>

<style>
	.ink-btn {
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		font-family: var(--font-family);
		border: 1px solid transparent;
	}

	.primary {
		background: var(--color-accent-primary);
		color: white;
		border: none;
	}

	.primary:hover:not(.disabled) {
		background: var(--color-accent-secondary);
	}

	.secondary {
		background: transparent;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.secondary:hover:not(.disabled) {
		background: var(--color-bg-elevated);
	}

	.danger {
		background: var(--color-error);
		color: white;
		border: none;
	}

	.danger:hover:not(.disabled) {
		background: #dc2626;
	}

	.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global(.ink-btn) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
	}
</style>