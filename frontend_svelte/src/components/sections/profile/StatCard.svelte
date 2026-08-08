<script lang="ts">
	let {
		label,
		value,
		icon
	}: {
		label: string;
		value: string | number;
		icon: string;
	} = $props();
</script>

<div class="stat-card">
	<span class="stat-icon">{icon}</span>
	<div class="stat-info">
		<span class="stat-value">{value}</span>
		<span class="stat-label">{label}</span>
	</div>
</div>

<style>
	.stat-card {
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-secondary);
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.stat-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.stat-info {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.stat-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
	}

	@media (max-width: 480px) {
		.stat-card {
			padding: var(--space-sm);
		}

		.stat-value {
			font-size: var(--font-size-lg);
		}

		.stat-label {
			font-size: var(--font-size-xs);
		}
	}
</style>
