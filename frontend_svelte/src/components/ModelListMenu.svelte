<script lang="ts">
	import ModelBlock from './ModelBlock.svelte';
	import Sheet from './Common/Sheet.svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import { pageState } from '$lib/states/menus.svelte';

	$effect(() => {
		modelsState.loadModels(true); // 모델 메뉴 명시 열람 = 항상 최신
	});
</script>

<Sheet onClose={() => (pageState.isModel_menu_open = false)} padded={false}>
	<div class="model-list">
		{#each modelsState.list as model (model.id)}
			<ModelBlock {model} />
		{/each}
	</div>
</Sheet>

<style>
	.model-list {
		display: flex;
		flex-direction: column;
		/* 모델이 늘어도 화면을 다 덮지 않고 넘겨볼 수 있게 */
		max-height: 60dvh;
		overflow-y: auto;
	}
</style>
