<script lang="ts">
	let {
		onclick,
		zIndex = 998,
		role = 'presentation',
		ariaLabel,
		tabindex,
		onkeydown
	}: {
		onclick?: (e: MouseEvent) => void;
		zIndex?: number;
		role?: string;
		ariaLabel?: string;
		tabindex?: number;
		onkeydown?: (e: KeyboardEvent) => void;
	} = $props();
</script>

<div
	class="overlay"
	style:z-index={zIndex}
	{role}
	aria-label={ariaLabel}
	{tabindex}
	{onkeydown}
	{onclick}
></div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: var(--color-scrim);
	}
</style>
