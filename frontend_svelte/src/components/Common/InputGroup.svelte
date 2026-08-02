<script lang="ts">
	let {
		label,
		for: forId,
		children
	} = $props<{
		label: string;
		for: string;
		children: any;
	}>();
</script>

<div class="input-group">
	<label class="input-label" for={forId}>{label}</label>
	{@render children()}
</div>

<style>
	.input-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.input-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		font-weight: 500;
	}
</style>