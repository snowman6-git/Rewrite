<script lang="ts">
	let {
		children,
		class: className = '',
		variant = 'primary',
		disabled = false,
		href,
		onclick,
		...props
	} = $props<{
		children?: any;
		class?: string;
		variant?: 'primary' | 'secondary' | 'danger';
		disabled?: boolean;
		/** 지정하면 <button> 대신 <a>로 렌더링되어 동일한 버튼 스타일의 링크가 된다. */
		href?: string;
		onclick?: (e: MouseEvent) => void;
	}>();
</script>

{#if href && !disabled}
	<a
		class="ink-btn"
		class:primary={variant === 'primary'}
		class:secondary={variant === 'secondary'}
		class:danger={variant === 'danger'}
		class:list={className ? [className].filter(Boolean) : undefined}
		{href}
		{...props}
	>
		{@render children()}
	</a>
{:else}
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
{/if}

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