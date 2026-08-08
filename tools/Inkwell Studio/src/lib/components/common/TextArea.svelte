<script lang="ts">
	let {
		label,
		value = $bindable(''),
		placeholder = '',
		rows = 4,
		required = false,
		disabled = false,
		name,
		id,
		resize = 'vertical',
		oninput,
		...props
	} = $props<{
		label?: string;
		value?: string;
		placeholder?: string;
		rows?: number;
		required?: boolean;
		disabled?: boolean;
		name?: string;
		id?: string;
		resize?: 'vertical' | 'horizontal' | 'both' | 'none';
		oninput?: (e: Event) => void;
	}>();

	let textareaRef: HTMLTextAreaElement;
</script>

<div class="ink-textarea-wrapper">
	{#if label}
		<label for={id || name} class="ink-label">
			{label}
			{#if required}
				<span class="required">*</span>
			{/if}
		</label>
	{/if}
	<textarea
		bind:this={textareaRef}
		bind:value
		{placeholder}
		{rows}
		{required}
		{disabled}
		{name}
		{id}
		class="ink-textarea resize-{resize}"
		oninput={oninput}
		{...props}
	></textarea>
</div>

<style>
	.ink-textarea-wrapper {
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

	.ink-textarea {
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
		resize: vertical;
		min-height: 80px;
	}

	.ink-textarea:focus {
		border-color: var(--color-accent-primary);
	}

	.ink-textarea:disabled {
		background: var(--color-bg-secondary);
		cursor: not-allowed;
		opacity: 0.6;
	}

	.ink-textarea::placeholder {
		color: var(--color-text-tertiary);
	}

	.resize-horizontal {
		resize: horizontal;
	}

	.resize-both {
		resize: both;
	}

	.resize-none {
		resize: none;
	}
</style>