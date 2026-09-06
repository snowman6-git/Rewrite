<script lang="ts">
	import BackBtn from '$components/BackBtn.svelte';
	import HamMenu from '$components/HamMenu.svelte';
	import ModelListMenu from '$components/ModelListMenu.svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import { pageState } from '$lib/states/menus.svelte';

	let { title, onToggleModel }: { title: string; onToggleModel: () => void } = $props();
</script>

<header class="header">
	<div class="header-left">
		<BackBtn />
		<h1 class="book-title">{title}</h1>
	</div>
	<div class="header-right">
		{#if modelsState.isLoading}
			<button class="model-btn" disabled aria-label="모델 로딩중">
				<span class="loading-dots">
					<span></span>
					<span></span>
					<span></span>
				</span>
			</button>
		{:else}
			<button class="model-btn" onclick={onToggleModel}>
				<span class="model-icon">◈</span>
				<span class="model-name">{modelsState.selectedModel?.name || '모델 선택'}</span>
			</button>
		{/if}

		<HamMenu />
	</div>
</header>

{#if pageState.isModel_menu_open}
	<ModelListMenu />
{/if}

<style>
	.header {
		height: var(--header-height);
		padding: 0 var(--space-md);
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		backdrop-filter: blur(10px);
		flex-shrink: 0;
		z-index: 100;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
		flex: 1;
	}

	.book-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		min-width: 0;
		flex-shrink: 1;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-shrink: 0;
	}

	.model-btn {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		transition: all var(--transition-fast);
		white-space: nowrap;
		flex-shrink: 0;
		max-width: 14rem;
	}

	.model-btn:hover:not(:disabled) {
		background: var(--color-bg-hover);
		border-color: var(--color-accent-primary);
	}

	.model-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.model-icon {
		color: var(--color-accent-primary);
		font-size: var(--font-size-sm);
	}

	.model-name {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.loading-dots {
		display: flex;
		gap: 3px;
	}
	.loading-dots span {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--color-accent-primary);
		animation: loadingDot 1.4s ease-in-out infinite;
	}
	.loading-dots span:nth-child(2) {
		animation-delay: 0.2s;
	}
	.loading-dots span:nth-child(3) {
		animation-delay: 0.4s;
	}
	@keyframes loadingDot {
		0%,
		80%,
		100% {
			transform: scale(0.6);
			opacity: 0.4;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@media (max-width: 640px) {
		.header {
			height: 3rem;
			padding: 0 var(--space-sm);
		}

		.book-title {
			font-size: var(--font-size-base);
			max-width: 50vw;
		}
	}
</style>
