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

	.ink-textarea-wrapper:focus-within .ink-label {
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
		transition: all var(--transition-fast);
		resize: vertical;
		min-height: 80px;
		position: relative;
		line-height: 1.6;
	}

	.ink-textarea::before {
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

	.ink-textarea:hover {
		border-color: var(--color-accent-primary);
		background: var(--color-bg-elevated);
	}

	.ink-textarea:focus {
		border-color: var(--color-accent-primary);
		background: var(--color-bg-elevated);
		box-shadow: var(--shadow-glow-md);
	}

	.ink-textarea:focus::before {
		opacity: 1;
		background: radial-gradient(circle at center, var(--color-accent-glow) 0%, transparent 70%);
	}

	.ink-textarea:disabled {
		background: var(--color-bg-secondary);
		cursor: not-allowed;
		opacity: 0.6;
		border-color: var(--color-border-subtle);
	}

	.ink-textarea::placeholder {
		color: var(--color-text-tertiary);
		transition: color var(--transition-fast);
	}

	.ink-textarea:focus::placeholder {
		color: var(--color-text-secondary);
	}

	/* Custom resize handle */
	.ink-textarea {
		resize: vertical;
		overflow: auto;
	}

	.ink-textarea::-webkit-resizer {
		background: linear-gradient(135deg, transparent 50%, var(--color-accent-primary) 50%);
		border-radius: 2px;
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

	@media (max-width: 768px) {
		.ink-textarea {
			padding: var(--space-sm);
			font-size: var(--font-size-base);
			min-height: 100px;
		}
	}
</style>