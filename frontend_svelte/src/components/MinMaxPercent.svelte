<script lang="ts">
	let { min, max } = $props<{
		min: number,
		max: number;
	}>();
</script>
{(min / max * 100).toFixed(2)}%
<style>
</style>
