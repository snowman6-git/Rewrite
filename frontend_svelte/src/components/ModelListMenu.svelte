<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import ModelBlock from './ModelBlock.svelte';
	import { onMount } from 'svelte';
	import { modelsState } from '$lib/states/models.svelte';

	let menuHeight = $state(0);
	// 열때마다 리로드 하게 해두긴했는데, 서빙엔진이 모델폴더 실시간 변화를 인지 못하는거 같음, 알아볼것
	// 여차하면 나중에 통합 런쳐 만들때 재시작하게 하면 됌
	onMount(() => {
		modelsState.loadModels();
	});
</script>

<div
	id="model_menu"
	// 모델 메뉴의 높이를 측정하여 애니메이션에 활용
	bind:clientHeight={menuHeight}
	transition:fly={{ y: menuHeight, duration: 200, easing: cubicOut }}
>
	<div id="model_list">
		{#each modelsState.list as model (model.id)}
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
