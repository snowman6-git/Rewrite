<script lang="ts">
	let {
		label,
		value = $bindable(''),
		type = 'text',
		placeholder = '',
		required = false,
		disabled = false,
		name,
		id,
		oninput,
		...props
	} = $props<{
		label?: string;
		value?: string;
		type?: string;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		name?: string;
		id?: string;
		oninput?: (e: Event) => void;
	}>();

	let inputRef: HTMLInputElement;
</script>

<div class="ink-input-wrapper">
	{#if label}
		<label for={id || name} class="ink-label">
			{label}
			{#if required}
				<span class="required">*</span>
			{/if}
		</label>
	{/if}
	<input
		bind:this={inputRef}
		bind:value
		{type}
		{placeholder}
		{required}
		{disabled}
		{name}
		{id}
		class="ink-input"
		oninput={oninput}
		{...props}
	/>
</div>

<style>
	.ink-input-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		width: 100%;
		position: relative;
	}

	.ink-label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-secondary);
		transition: all var(--transition-fast);
		margin-left: 2px;
	}

	.ink-input-wrapper:focus-within .ink-label {
		color: var(--color-accent-primary);
		transform: translateX(2px);
	}

	.required {
		color: var(--color-error);
		margin-left: var(--space-xs);
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.ink-input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		outline: none;
		transition: all var(--transition-fast);
		position: relative;
	}

	.ink-input::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: var(--radius-md);
		opacity: 0;
		transition: opacity var(--transition-fast);
		pointer-events: none;
	}

	.ink-input:hover {
		border-color: var(--color-accent-primary);
		background: var(--color-bg-elevated);
	}

	.ink-input:focus {
		border-color: var(--color-accent-primary);
		background: var(--color-bg-elevated);
		box-shadow: var(--shadow-glow-md);
	}

	.ink-input:focus::before {
		opacity: 1;
		background: radial-gradient(circle at center, var(--color-accent-glow) 0%, transparent 70%);
	}

	.ink-input:disabled {
		background: var(--color-bg-secondary);
		cursor: not-allowed;
		opacity: 0.6;
		border-color: var(--color-border-subtle);
	}

	.ink-input::placeholder {
		color: var(--color-text-tertiary);
		transition: color var(--transition-fast);
	}

	.ink-input:focus::placeholder {
		color: var(--color-text-secondary);
	}

	@media (max-width: 768px) {
		.ink-input {
			padding: var(--space-sm);
			font-size: var(--font-size-base);
		}
	}
</style>