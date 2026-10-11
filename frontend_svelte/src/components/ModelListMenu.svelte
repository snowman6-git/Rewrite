<script lang="ts">
	import ModelBlock from './ModelBlock.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { modelsState } from '$lib/states/models.svelte';
	import { pageState } from '$lib/states/menus.svelte';

	$effect(() => {
		modelsState.loadModels(true); // 모델 메뉴 명시 열람 = 항상 최신
	});
</script>

<div
	class="overlay"
	role="presentation"
	onclick={() => {
		pageState.isModel_menu_open = false;
	}}
></div>
<div
	class="model-menu"
	role="group"
	aria-label="모델 선택"
	in:fly={{ y: 100, duration: 250, easing: cubicOut }}
	out:fly={{ y: 100, duration: 250, easing: cubicOut }}
>
	<div class="model-list">
		{#each modelsState.list as model (model.id)}
			<ModelBlock {model} />
		{/each}
	</div>
</div>

<style>
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--color-scrim);
		z-index: 998;
	}

	/* composer 오버레이와 같은 언어: 하단 시트, 조용한 테두리, 플랫 (글래스 금지) */
	.model-menu {
		z-index: 999;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		user-select: none;
		-webkit-user-select: none;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-strong);
		border-bottom: none;
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
	}

	.model-list {
		padding: var(--space-2xs);
		display: flex;
		flex-direction: column;
		/* 모델이 늘어도 화면을 다 덮지 않고 넘겨볼 수 있게 */
		max-height: 60dvh;
		overflow-y: auto;
	}
</style>
