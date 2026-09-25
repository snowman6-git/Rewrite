<script lang="ts">
	let {
		value = $bindable(''),
		onSave,
		onCancel
	}: {
		value?: string;
		onSave: () => void;
		onCancel: () => void;
	} = $props();

	let ta: HTMLTextAreaElement | undefined;
	$effect(() => {
		if (!ta) return;
		ta.style.height = 'auto';
		ta.style.height = ta.scrollHeight + 'px';
	});
</script>

<textarea class="edit-textarea" bind:this={ta} bind:value={value} rows="1"></textarea>
<div class="edit-actions">
	<button class="edit-btn save" type="button" onclick={onSave}>저장</button>
	<button class="edit-btn cancel" type="button" onclick={onCancel}>취소</button>
</div>

<style>
	.edit-textarea {
		width: 100%;
		resize: none;
		overflow: hidden;
		padding: var(--space-sm);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		font-family: inherit;
		font-size: var(--font-size-base);
		line-height: 1.5;
		box-sizing: border-box;
	}

	.edit-textarea:focus {
		outline: none;
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px var(--color-accent-glow);
	}

	.edit-actions {
		display: flex;
		gap: var(--space-xs);
		justify-content: flex-end;
	}

	.edit-btn {
		padding: var(--space-xs) var(--space-sm);
		border: none;
		border-radius: var(--radius-sm);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.edit-btn.save {
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
	}

	.edit-btn.save:hover {
		background: var(--color-accent-secondary);
	}

	.edit-btn.cancel {
		background: var(--color-bg-tertiary);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}
</style>
