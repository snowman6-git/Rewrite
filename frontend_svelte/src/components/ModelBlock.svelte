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
	role="menuitem"
	aria-current={isSelected ? 'true' : undefined}
	onclick={() => {
		modelsState.selectModel(model.id);
		pageState.isModel_menu_open = false;
	}}
>
	<!-- 체크는 자리를 고정한다 (display:none 쓰면 행마다 이름 x 좌표가 어긋난다) -->
	<span class="check-icon" aria-hidden="true">✓</span>
	<div class="model-info">
		<div class="model-name">{model.name}</div>
		<div class="model-desc">{model.desc}</div>
	</div>
</button>

<style>
	.model-item {
		display: flex;
		align-items: center;
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-primary);
		text-align: left;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			border-color var(--transition-fast);
		gap: var(--space-sm);
	}

	/* 선택 = 테마 액센트 필 (네비 활성·정렬 chip과 동일 언어) */
	.model-item.selected {
		background: var(--color-accent-primary);
		border-color: var(--color-accent-primary);
		color: var(--color-text-inverse);
	}

	.model-item.selected .model-name {
		color: var(--color-text-inverse);
	}

	.model-item.selected .model-desc {
		color: var(--color-text-inverse);
		opacity: 0.75;
	}

	.model-item.selected .check-icon {
		color: var(--color-text-inverse);
	}

	@media (hover: hover) {
		.model-item:hover {
			background: var(--color-bg-hover);
			border-color: var(--color-border-strong);
		}
	}

	.check-icon {
		width: 1rem;
		flex-shrink: 0;
		text-align: center;
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		visibility: hidden;
	}

	.model-item.selected .check-icon {
		visibility: visible;
	}

	.model-info {
		flex: 1;
		min-width: 0;
	}

	.model-name {
		font-size: var(--font-size-base);
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

	@media (max-width: 640px) {
		.model-item {
			padding: var(--space-xs) var(--space-sm);
		}

		.model-name {
			font-size: var(--font-size-sm);
		}
	}
</style>
