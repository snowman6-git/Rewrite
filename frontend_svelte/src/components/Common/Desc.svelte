<script lang="ts">
	let { children } = $props();
</script>

<div class="desc">{@render children()}</div>

<style>
	.desc {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}
</style>
