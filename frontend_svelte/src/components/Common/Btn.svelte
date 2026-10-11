<script lang="ts">
	import type { Snippet } from 'svelte';

	type BtnVariant = 'default' | 'cancel' | 'save' | 'reset';

	let {
		variant = 'default',
		disabled = false,
		children,
		onclick
	} = $props<{
		variant?: BtnVariant;
		disabled?: boolean;
		children: Snippet;
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
		padding: var(--space-sm) var(--space-md);
		min-height: 26px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: center;
	}

	.btn-cancel {
		background: var(--color-bg-tertiary);
		color: var(--color-text-secondary);
	}

	@media (hover: hover) {
		.btn-cancel:hover:not(:disabled) {
			background: var(--color-bg-hover);
			border-color: var(--color-text-tertiary);
		}
	}

	.btn-save {
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
		border-color: var(--color-accent-primary);
	}

	@media (hover: hover) {
		.btn-save:hover:not(:disabled) {
			background: var(--color-accent-secondary);
			border-color: var(--color-accent-secondary);
		}
	}

	.btn-reset {
		background: transparent;
		color: var(--color-error);
		border-color: color-mix(in srgb, var(--color-error) 30%, transparent);
	}

	@media (hover: hover) {
		.btn-reset:hover:not(:disabled) {
			background: color-mix(in srgb, var(--color-error) 10%, transparent);
			border-color: var(--color-error);
		}
	}
</style>
