<script lang="ts">
	import { modelsState } from '$lib/states/models.svelte';
	import { pageState } from '$lib/states/menus.svelte';

	$effect(() => {
		modelsState.loadModels();
	});

	function openMenu() {
		pageState.isModel_menu_open = true;
	}
</script>

<span class="group-label">AI</span>
<div class="card">
	<button class="row" onclick={openMenu}>
		<span class="row-label">모델</span>
		<span class="row-value">
			{modelsState.selectedModel?.name ?? '미선택'}
			<svg
				class="chevron"
				viewBox="0 0 24 24"
				width="14"
				height="14"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><polyline points="9 18 15 12 9 6" /></svg
			>
		</span>
	</button>
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
		width: 100%;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		min-height: 2.75rem;
		border: none;
		border-radius: 0;
		background: transparent;
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		font-family: inherit;
		text-align: left;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.row:hover {
		background: var(--color-bg-elevated);
	}

	.row-label {
		font-weight: 500;
	}

	.row-value {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-text-secondary);
	}

	.chevron {
		color: var(--color-text-tertiary);
	}
</style>
