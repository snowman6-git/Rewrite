<script lang="ts">
	let { children } = $props();
</script>

<div class="btn-case">{@render children()}</div>

<style>
	.btn-case {
		display: flex;
		gap: var(--space-sm);
	}
</style>
