<script lang="ts">
	type BtnVariant = 'default' | 'cancel' | 'save' | 'reset';

	let {
		variant = 'default',
		disabled = false,
		children,
		onclick
	} = $props<{
		variant?: BtnVariant;
		disabled?: boolean;
		children: any;
		onclick?: () => void;
	}>();
</script>

<button
	class="btn"
	class:btn-cancel={variant === 'cancel'}
	class:btn-save={variant === 'save'}
	class:btn-reset={variant === 'reset'}
	{disabled}
	{onclick}
>
	{@render children()}
</button>

<style>
	.btn {
		flex: 1;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: center;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-cancel {
		background: var(--color-bg-tertiary);
		color: var(--color-text-secondary);
	}

	.btn-cancel:hover:not(:disabled) {
		background: var(--color-bg-hover);
		border-color: var(--color-text-tertiary);
	}

	.btn-save {
		background: var(--color-accent-primary);
		color: #fff;
		border-color: var(--color-accent-primary);
	}

	.btn-save:hover:not(:disabled) {
		background: var(--color-accent-secondary);
		border-color: var(--color-accent-secondary);
		box-shadow: var(--shadow-glow);
	}

	.btn-reset {
		background: transparent;
		color: #ef4444;
		border-color: rgba(239, 68, 68, 0.3);
	}

	.btn-reset:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.1);
		border-color: #ef4444;
	}
</style>
