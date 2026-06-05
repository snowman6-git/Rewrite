<script lang="ts">
	let isHammenu_open = $state(false);
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	
	import WorldEdit from './views/WorldEdit.svelte';
	import Persona from './views/Persona.svelte';
	import Memory from './views/Memory.svelte';

	let menu_now = $state(0);
	let menus = ['설정', '월드에딧', '페르소나', '메모리'];
</script>

<button
	id="h_button"
	onclick={() => {
		isHammenu_open = !isHammenu_open;
	}}
>
</button>

{#if isHammenu_open}
	<div id="overlay" onclick={() => (isHammenu_open = false)}></div>
	<div id="side_menu" transition:fly={{ x: 100, duration: 200, easing: cubicOut }}>
		<div id="header">
			<!-- 현재 메뉴 따라서 이름 동적변경 -->
			<div style="font-size: 1.4rem;">{menus[menu_now]}</div>
			<button
				id="x_button"
				onclick={() => {
					if (menu_now == 0) {
						isHammenu_open = !isHammenu_open;
					} else {
						menu_now = 0;
					}
				}}
			>
			</button>
		</div>

		{#if menu_now == 1}
			<WorldEdit />
		{:else if menu_now == 2}
			<Persona />
		{:else if menu_now == 3}
			<Memory/>
		{:else}
			<!-- 나쁘진 않아보이는데, 인덱스로 구현하려는 시도로 너무 많은걸 쓰진 않았는지 고민할것 -->
			<div class="btn_case">
				{#each menus as menu, number (menu)}
					{#if number > 0}
						<button class="h_menu_option" onclick={() => (menu_now = number)}>{menu}</button>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.btn_case {
		width: 100%;
		height: auto;
		padding: 0.2rem;
	}
	.h_menu_option {
		width: 100%;
		height: 2rem;
		font-size: 1.2rem;
	}
	#overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
	}
	#x_button,
	#h_button {
		width: auto;
		height: 100%;
		aspect-ratio: 1/1;
		background-position: center;
		background-size: 80%;
		background-repeat: no-repeat;
	}
	#h_button {
		background-image: url('../lib/assets/h_menu.svg');
	}
	#x_button {
		background-image: url('../lib/assets/back.svg');
		transform: rotate(180deg);
		background-size: 1.5rem;
	}
	#header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 3rem;
		border-bottom: 0.2rem solid gray;
	}
	#side_menu {
		padding: 1rem;
		width: 30rem;
		height: 100%;
		backdrop-filter: blur(0.2rem);
		background-color: rgba(0, 0, 0, 0.65);
		position: fixed;
		z-index: 999;
		top: 0;
		right: 0;
		display: flex;
		flex-direction: column;
	}
	@media (orientation: portrait) {
		#side_menu {
			width: 100dvw;
		}
	}
</style>
