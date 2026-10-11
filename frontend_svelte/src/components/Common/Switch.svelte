<script lang="ts">
	let {
		checked = false,
		label = '',
		onToggle
	}: { checked: boolean; label?: string; onToggle: () => void } = $props();
</script>

<button class="switch" role="switch" aria-checked={checked} aria-label={label} onclick={onToggle}>
	<span class="knob"></span>
</button>

<style>
	.switch {
		width: 44px;
		height: 26px;
		border-radius: 999px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-tertiary);
		position: relative;
		cursor: pointer;
		padding: 0;
		flex-shrink: 0;
		transition:
			background var(--transition-fast),
			border-color var(--transition-fast);
	}

	.switch[aria-checked='true'] {
		background: var(--color-accent-primary);
		border-color: var(--color-accent-primary);
	}

	.switch .knob {
		position: absolute;
		top: 3px;
		left: 2px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: var(--color-text-secondary);
		transition:
			transform var(--transition-fast),
			background var(--transition-fast);
	}

	.switch[aria-checked='true'] .knob {
		transform: translateX(20px);
		background: var(--color-text-inverse);
	}
</style>
