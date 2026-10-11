<script lang="ts">
	// 입력기 공통 필드. autocomplete은 브라우저 자동완성/접근성 요구로 전달이 필수
	let {
		type = 'text',
		value = $bindable(''),
		placeholder = '',
		class: cls,
		id,
		rows,
		autocomplete,
		disabled = false,
		onkeydown
	} = $props<{
		type?: 'text' | 'textarea' | 'password';
		value?: string;
		placeholder?: string;
		class?: string;
		id?: string;
		rows?: string | number;
		autocomplete?: string;
		disabled?: boolean;
		onkeydown?: (e: KeyboardEvent) => void;
	}>();
</script>

{#if type === 'textarea'}
	<textarea
		bind:value
		class="input-field textarea {cls}"
		{placeholder}
		{id}
		{rows}
		{disabled}
		{onkeydown}
	></textarea>
{:else}
	<input bind:value {type} class="input-field {cls}" {placeholder} {id} {autocomplete} {disabled} />
{/if}

<style>
	.input-field {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		outline: none;
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
	}

	.input-field:focus {
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px var(--color-accent-glow);
	}

	.input-field.textarea {
		resize: none;
		min-height: 5rem;
		line-height: 1.6;
	}
</style>
