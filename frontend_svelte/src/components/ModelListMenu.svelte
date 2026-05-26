<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import ModelBlock from './ModelBlock.svelte';
	let { model_list } = $props<{
		model_list: object;
	}>();
	let menuHeight = $state(0);
</script>

<!-- 나중에 메뉴열때마다 리스트업 다시하게 만들기 -->
<div
	id="model_menu"
	// 모델 메뉴의 높이를 측정하여 애니메이션에 활용
	bind:clientHeight={menuHeight}
	transition:fly={{ y: menuHeight, duration: 200, easing: cubicOut }}
>
	<div id="model_list">
		{#each model_list as model (model.id)}
			<ModelBlock {model} />
		{/each}
	</div>
</div>

<style>
	#model_menu {
		width: 100%;
		height: auto;
		overflow-y: scroll;
		position: absolute;
		bottom: 0;
		right: 0;
		left: 0;
		display: flex;
		justify-content: end;
		align-items: center;
		box-sizing: border-box;
		flex-direction: column;
		/* 표준 속성 */
		user-select: none;
		/* 구형 브라우저 지원 (Tauri는 필요 없으나 호환성용) */
		-webkit-user-select: none; /* Safari, Chrome, Edge */
		-moz-user-select: none; /* Firefox */
		-ms-user-select: none;
		z-index: 999;
	}
	#model_list {
		/* background-color: red; */
		display: flex;
		flex-direction: column;
		border: 0.2rem solid grey;
		border-bottom: none;
		box-sizing: border-box;
		background-color: black;
		border-radius: 1rem 1rem 0 0;
		width: 100%;
		height: auto;
		padding: 0.5rem;
		overflow-y: scroll;
	}
</style>
