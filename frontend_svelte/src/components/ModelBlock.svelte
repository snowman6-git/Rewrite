<script lang="ts">
	import { modelsState } from '$lib/states/models.svelte';
	import { pageState } from '$lib/states/menus.svelte';

	import type { ModelInfo } from '$lib/types';

	let { model } = $props<{ model: ModelInfo }>();
	let isSelected = $derived(model.id === modelsState.selectedModel?.id);
</script>

<button
	class="model-item"
	class:selected={isSelected}
	onclick={() => {
		modelsState.selectModel(model.id);
		pageState.isModel_menu_open = false;
	}}
>
	{#if isSelected}
		<div class="check-icon">✓</div>
	{/if}
	<div class="model-info">
		<div class="model-name">{model.name}</div>
		<div class="model-desc">{model.desc}</div>
	</div>
	<div class="model-meta">
		<span class="model-context">메모리: {model.context_size}</span>
	</div>
</button>

<style>
	.model-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-primary);
		text-align: left;
		cursor: pointer;
		transition: all var(--transition-fast);
		gap: var(--space-sm);
	}

	.model-item:hover {
		background: var(--color-bg-hover);
		border-color: var(--color-border);
	}

	.check-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: #4ade80;
		font-size: 0.875rem;
		font-weight: 700;
		flex-shrink: 0;
		margin-right: var(--space-xs);
	}

	.model-item:not(.selected) .check-icon {
		display: none;
	}

	.model-info {
		flex: 1;
		min-width: 0;
	}

	.model-name {
		font-size: var(--font-size-base);
		font-weight: 500;
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.model-desc {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 2px;
	}

	.model-meta {
		flex-shrink: 0;
		text-align: right;
	}

	.model-context {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 640px) {
		.model-item {
			padding: var(--space-xs) var(--space-sm);
		}

		.model-name {
			font-size: var(--font-size-sm);
		}
	}
</style>
