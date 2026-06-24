<script lang="ts">
	let { min, max } = $props<{
		min: number;
		max: number;
	}>();
</script>

{#if min != undefined && max != 0}
	{((min / max) * 100).toFixed(2)}%
{:else}
	0.00%
{/if}

<style>
</style>
