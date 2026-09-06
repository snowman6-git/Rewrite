<script lang="ts">
	import { onMount } from 'svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import { chatState } from '$lib/states/chat.svelte';
	import { pageState } from '$lib/states/menus.svelte';
	import { page } from '$app/stores';

	import ChatHeader from '$components/ChatHeader.svelte';
	import MessageList from '$components/MessageList.svelte';
	import ChatComposer from '$components/ChatComposer.svelte';
	import ToastContainer from '$components/Common/ToastContainer.svelte';

	const sessionId = $derived($page.url.pathname.split('/').filter(Boolean).pop());

	onMount(async () => {
		modelsState.loadModels();
		if (sessionId) {
			await chatState.initBook_id(sessionId);
			chatState.loadHistory();
		}
	});

	let book_title = $state('');

	let isDesktopMode = $derived(window.matchMedia('(pointer: fine)').matches);

	function handleGlobalKeyDown(event: KeyboardEvent) {
		if (isDesktopMode) {
			if (event.key === 'Enter' && !event.shiftKey) {
				chatState.sendMessage();
				event.preventDefault();
			}
		}
	}

	function toggle_model_menu() {
		pageState.isModel_menu_open = !pageState.isModel_menu_open;
	}
</script>

<svelte:head>
	<title>{book_title}</title>
</svelte:head>
<svelte:window onkeydown={handleGlobalKeyDown} />

<ToastContainer />

<div class="app-layout">
	<ChatHeader title={book_title} onToggleModel={toggle_model_menu} />
	<MessageList />
	<ChatComposer />
</div>

<style>
	.app-layout {
		width: 100dvw;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg-primary);
		overflow: hidden;
	}
</style>
