<script lang="ts">
	import pkg from '../../../../package.json';
</script>

<span class="group-label">앱</span>
<div class="card">
	<div class="row">
		<span class="row-text">
			<span class="row-label">버전</span>
			<span class="row-sub">Rewrite AI</span>
		</span>
		<span class="row-value">v{pkg.version}</span>
	</div>
</div>

<style>
	.group-label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--space-xs);
	}

	.card {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		min-height: 2.75rem;
	}

	.row-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.row-label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.row-sub {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}

	.row-value {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}
</style>
