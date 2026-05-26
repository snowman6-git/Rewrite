<script lang="ts">
	import { isModel_menu_open, selectedModel } from '../menu_store';
	let { model } = $props<{
		model: object;
	}>();
</script>

<button
	class="model"
	onclick={() => {
		$selectedModel = model;
		$isModel_menu_open = false;
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
		/* border-bottom: 0.1rem solid rgba(255, 255, 255, 0.5); */
	}
	/* .model:hover #model_name{
        font-size: 1.5rem;
    } */
</style>
