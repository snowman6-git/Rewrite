<script lang="ts">
	import ModelBlock from './ModelBlock.svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import { pageState } from '$lib/states/menus.svelte';

	onMount(() => {
		modelsState.loadModels();
	});
</script>

<div
	class="overlay"
	role="presentation"
	onclick={() => {
		pageState.isModel_menu_open = false;
	}}
></div>
<button
	class="model-menu"
	role="menu"
	tabindex="-1"
	in:fly={{ y: 100, duration: 250, easing: cubicOut }}
	out:fly={{ y: 100, duration: 250, easing: cubicOut }}
>
	<div class="model-list">
		{#each modelsState.list as model (model.id)}
			<ModelBlock {model} />
		{/each}
	</div>
</button>

<style>
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 998;
		backdrop-filter: blur(2px);
	}

	.model-menu {
		z-index: 999;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		user-select: none;
		-webkit-user-select: none;
	}
	.model-list {
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		border: 0.15rem solid var(--color-accent-primary);
		border-radius: 1rem 1rem 0 0;
		border-bottom: none;
		overflow: hidden;
		box-shadow: var(--shadow-lg);
	}
</style>
