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

	const sessionId = $derived($page.url.pathname.split('/').filter(Boolean).pop());

	onMount(() => {
		modelsState.loadModels();
	});

	// 책 A → 책 B SPA 이동에서 +page.svelte는 remount되지 않고 onMount가 다시 안 돈다 (실측: 책 이동 후 chat_listup 요청 0건).
	// 초기화를 sessionId effect로 옮겨야 새 책의 히스토리가 뜬다 — 미이행 시 이전 책 50행이 그대로 보이고
	// 입력은 이전 책으로 전송되고 최하단 앵커도 발생하지 않는다 ("맨 아래로 안 내려감"의 실체).
	$effect(() => {
		if (!sessionId) return;
		(async () => {
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
		})();
	});

	let book_title = $state('');

	let isDesktopMode = $derived(window.matchMedia('(pointer: fine)').matches);

	function handleGlobalKeyDown(event: KeyboardEvent) {
		if (!isDesktopMode) return;
		if (event.key !== 'Enter' || event.shiftKey) return;
		// 한국어 한자/IME 조합 확정 Enter는 전송이 아니다 (실측: 조합 확정 Enter 1번에 4행 증가)
		// shortcut: keyCode는 deprecated — isComposing이 못 잡는 229 경계(일부 WebView)용
		if (event.isComposing || event.keyCode === 229) return;
		const t = event.target instanceof Element ? event.target : null;
		// 채팅 입력창의 Enter는 전송, 다른 입력기(모달/검색/에딧)의 Enter는 그대로 두기
		if (
			t &&
			!t.closest('.user-input') &&
			t.matches('input,textarea,select,[contenteditable="true"]')
		)
			return;
		// 모달·하단 시트·햄메뉴가 열려 있으면 Enter를 뺏지 않는다 (확인 버튼 활성화를 preventDefault가 죽임)
		if (t?.closest('.modal, .menu-sheet, .select-bar, .side_menu')) return;
		chatState.sendMessage();
		event.preventDefault();
	}

	function toggle_model_menu() {
		pageState.isModel_menu_open = !pageState.isModel_menu_open;
	}
</script>

<svelte:head>
	<title>{book_title}</title>
</svelte:head>
<svelte:window onkeydown={handleGlobalKeyDown} />

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
		background: transparent; /* body의 원고지 격자를 드러낸다 */
		overflow: hidden;
		position: relative; /* ChatComposer 고정 레이어의 앵커 */
	}
</style>
