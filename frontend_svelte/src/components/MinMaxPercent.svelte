<script lang="ts">
	let {
		min,
		max,
		class: className = ''
	} = $props<{
		min: number;
		max: number;
		class?: string;
	}>();

	let percent = $derived(
		min != undefined && max != 0 ? ((min / max) * 100).toFixed(2) + '%' : '0.00%'
	);

	let progressColor = $derived(max > 0 ? (min / max) * 100 : 0);
</script>

<span class:className class="mem-percent">
	{percent}
</span>

<style>
	.mem-percent {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		white-space: nowrap;
		min-width: 3rem;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
</style>
