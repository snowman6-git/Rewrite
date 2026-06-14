<script lang="ts">
	import '$lib/assets/chat_body.css';

	import { onMount, setContext, tick } from 'svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import { chatState } from '$lib/states/chat.svelte';
	onMount(() => {
		modelsState.loadModels();
		chatState.loadHistory();
	});
	let book_title = $state('테스트북123MKii-Alpha'); //나중에 서버에서 받아오기
	let isModel_menu_open = $state({
		isOpen: false
	});
	setContext('model_menu', isModel_menu_open);

	// 컴포넌트
	import ModelListMenu from '$components/ModelListMenu.svelte';
	import BackBtn from '$components/BackBtn.svelte';
	import HamMenu from '$components/HamMenu.svelte';
	import ChatTools from '$components/ChatTools.svelte';
	import ChatBlock from '$components/ChatBlock.svelte';

	let isDesktopMode = $state(false);
	onMount(() => {
		isDesktopMode = window.matchMedia('(pointer: fine)').matches;
	});
	let chat_body: HTMLDivElement;
	$effect(() => {
		// messages 배열의 내용이 바뀌는 것을 Svelte가 감지합니다.
		chatState.list.map((m) => m.content);
		if (chat_body) {
			// 화면이 실제 업데이트될 때까지 아주 잠시(tick) 기다린 후 스크롤
			tick().then(() => {
				chat_body.scrollTo({
					top: chat_body.scrollHeight
					// behavior: 'smooth' // 부드럽게 스크롤 (원치 않으면 'auto')
				});
			});
		}
	});

	function handleGlobalKeyDown(event: KeyboardEvent) {
		// 쉬프트 엔터면 패스하기
		if (isDesktopMode) {
			if (event.key === 'Enter' && !event.shiftKey) {
				chatState.sendMessage();
				event.preventDefault();
			}
		} else {
			return; // 모바일에서는 글로벌 엔터 이벤트를 무시합니다.
		}
	}
	function open_model_menu() {
		isModel_menu_open.isOpen = !isModel_menu_open.isOpen;
	}
</script>

<svlte:head>
	<title>{book_title}</title>
</svlte:head>
<svelte:window on:keydown={handleGlobalKeyDown} />

<div id="main">
	<div id="header">
		<div id="header_left">
			<BackBtn />
			<div id="title">{book_title}</div>
		</div>
		<div id="header_right">
			{#if modelsState.isLoading}
				<button id="model_menu_btn" disabled>Loading...</button>
			{:else}
				<button id="model_menu_btn" onclick={open_model_menu}
					>{modelsState.selectedModel?.name || '모델 선택'}</button
				>
			{/if}
			<button
				title=""
				id="force_menu"
				onclick={() => (isModel_menu_open.isOpen = false)}
				class:disable={isModel_menu_open.isOpen}
			>
			</button>
			{#if isModel_menu_open.isOpen}
				<ModelListMenu model_list={modelsState.list} />
			{/if}
			<HamMenu />
		</div>
	</div>

	<div id="chat_body" bind:this={chat_body}>
		{#each chatState.list as msg (msg.id)}
			<ChatBlock text={msg.content} />
		{/each}
	</div>
	<div id="chat_input">
		{#if modelsState.isLoading}
			<textarea id="user_input" placeholder="불러오는중..."></textarea>
		{:else}
			<textarea
				id="user_input"
				placeholder="텍스트 입력"
				autocomplete="off"
				bind:value={chatState.user_input}
			></textarea>
		{/if}
		<ChatTools />
	</div>
</div>

<style>
	#main {
		width: 100dvw;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	#force_menu {
		width: 100dvw;
		height: 100dvh;
		position: fixed;
		display: none;
		left: 0;
		right: 0;
		bottom: 0;
		top: 0;
	}
	#force_menu.disable {
		display: block;
		/* background-color: rgba(0, 0, 0, 1); */
		backdrop-filter: blur(0.2rem);
		/* opacity: 0.5; */
	}
	#header {
		width: 100dvw;
		height: 3rem;
		padding: 0.5rem 0.5rem 0.5rem 0.5rem;
		/* padding-left: 0.5rem; padding-right: 0.5rem; */
		border-bottom: 0.1rem solid gray;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		/* justify-content: space-around; */
	}
	#header_right,
	#header_left {
		width: 50%;
		height: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.5rem;
	}
	#title {
		height: auto;
		width: auto;
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
	#header_right {
		justify-content: end;
	}
	#header_left {
		font-size: 1.25rem;
		font-weight: bold;
		justify-content: start;
	}
	#model_menu_btn {
		width: 80%;
		height: 2rem;
		max-width: 10rem;
		text-align: center;
		text-wrap: nowrap;
		overflow: hidden;
		background-color: transparent;
		border: 0.2rem solid grey;
		padding: 0.25rem;
		font-size: 1rem;
		text-overflow: ellipsis;
	}
</style>
