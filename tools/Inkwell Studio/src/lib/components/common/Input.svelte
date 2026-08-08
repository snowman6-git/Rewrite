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
	}

	.ink-label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.required {
		color: var(--color-error);
		margin-left: var(--space-xs);
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
		transition: border-color var(--transition-fast);
	}

	.ink-input:focus {
		border-color: var(--color-accent-primary);
	}

	.ink-input:disabled {
		background: var(--color-bg-secondary);
		cursor: not-allowed;
		opacity: 0.6;
	}

	.ink-input::placeholder {
		color: var(--color-text-tertiary);
	}
</style>