<script lang="ts">
    // 이미 여기서 모델리스트를 받아올 수 있는데 상위요소에서 굳이 받고 each할 필요있는지 고민하기
	import { modelsState } from '$lib/states/models.svelte';
	import { getContext } from 'svelte';
	let { model } = $props<{
		model: object;
	}>();
	let isModel_menu_open = getContext<{ isOpen: boolean; title: string }>('model_menu');
</script>
<button
	class="model"
	onclick={() => {
		modelsState.selectedModel = model;
		isModel_menu_open.isOpen = false;
	}}
>
	<div id="model_name">{model.name}</div>
	<div id="model_desc">{model.desc}</div>
	<div id="model_hardware">{model.hardware}</div>
</button>

<style>
	#model_name {
		font-size: 1.1rem;
	}
	#model_desc {
		font-size: 0.85rem;
		opacity: 0.5;
	}
	#model_hardware {
		font-size: 0.75rem;
		opacity: 0.3;
	}
	.model {
		border: 0.2rem solid transparent;
		padding-top: 0.5rem;
		padding-bottom: 0.5rem;
	}
</style>
