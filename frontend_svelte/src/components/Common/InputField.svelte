<script lang="ts">
	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		class: className = '',
		id,
		rows,
		disabled = false
	} = $props<{
		type?: 'text' | 'textarea';
		value?: string;
		placeholder?: string;
		class?: string;
		id?: string;
		rows?: string | number;
		disabled?: boolean;
	}>();
</script>

{#if type === 'textarea'}
	<textarea bind:value class="input-field textarea" {placeholder} {id} {rows} {disabled}></textarea>
{:else}
	<input bind:value {type} class="input-field" {placeholder} {id} {disabled} />
{/if}

<style>
	.input-field {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		outline: none;
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
	}

	.input-field:focus {
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px var(--color-accent-glow);
	}

	.input-field::placeholder {
		color: var(--color-text-tertiary);
	}

	.input-field.textarea {
		resize: none;
		min-height: 5rem;
		line-height: 1.6;
	}
</style>
