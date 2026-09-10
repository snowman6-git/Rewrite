<script lang="ts">
	import { onMount } from 'svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import { chatState } from '$lib/states/chat.svelte';
	import { pageState } from '$lib/states/menus.svelte';
	import { library_listup } from '$lib/api/book';
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
			// loadHistory가 내부적으로 historyPromise(모듈 스코프)를 보관하므로
			// sendMessage가 자동으로 await함. 반환값 할당 불필요.
			chatState.loadHistory();

			// 책 제목: backend /book_detail은 title을 안 주므로, 활성 목록에서 session_id로 매칭
			try {
				const active = await library_listup();
				const found = active.find(
					(b: { session_id?: string; id?: string; title?: string }) =>
						(b.session_id === sessionId || b.id === sessionId) && !!b.title
				);
				if (found?.title) book_title = found.title;
			} catch {
				// 실패해도 채팅은 계속 동작
			}
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
