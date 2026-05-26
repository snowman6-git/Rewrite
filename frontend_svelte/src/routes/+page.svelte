<script lang="ts">
	import { isModel_menu_open, selectedModel, isModel_loaded } from '../menu_store';
	import axios from 'axios';
	// 외부 라이브러리
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import '../chat_body.css';

	// 하이라이팅 라이브러리
	// import hljs from 'highlight.js/lib/core';
	// import bash from 'highlight.js/lib/languages/bash';
	// import diff from 'highlight.js/lib/languages/diff';
	// // hljs 사용할 언어 등록
	// hljs.registerLanguage('bash', bash);
	// hljs.registerLanguage('diff', diff);

	// Custom Data
	// import { markdownContent } from '../../static/markdown.ts';

	// 컴포넌트
	import ModelListMenu from '../components/ModelListMenu.svelte';
	import BackBtn from '../components/BackBtn.svelte';
	import { tick } from 'svelte';
	import HamMenu from '../components/HamMenu.svelte';
	import ChatTools from '../components/ChatTools.svelte';
	import { logic_plus } from '../api_options';

	// 환경변수
	import { PUBLIC_API_URL } from '$env/static/public';

	// primary key가 필요함, 아니면 같은 말은 같은 키로 인식해서 업데이트가 안됨
	interface Msg {
		id: string;
		sender: string;
		content: string;
	}
	interface ModelInfo {
		id: string;
		name: string;
		desc: string;
		status: string;
	}
	let model_list = $state<ModelInfo[]>([]);
	let user_input = $state<string>('');
	let MsgBox: Msg[] = $state([]);

	async function startup() {
		let chat_listup = await axios.get(`${PUBLIC_API_URL}/chat_listup`, { withCredentials: true });
		let chat_list = chat_listup.data;
		if (chat_list !== '') {
			MsgBox = chat_listup.data;
		}
	}
	startup();

	// 스토어는 이제 구식이라네.
	let { isModelResponding = $bindable(false) } = $props<{ isModelResponding: boolean }>();
	async function model_listup() {
		try {
			let model_list_api = await axios.get(`${PUBLIC_API_URL}/models`, { timeout: 5000 });
			model_list = model_list_api.data;
			// 로딩된 모델을 기본 선택값으로 설정(차후 소켓이든 뭐든 동적업데이트 < 아님 걍 챗 요청하고 돌아오는 응답으로 로드여부 확인 차피 1개만로드함)
			// -> 로드된 모델 없으면 일단 리스트의 첫번째 모델로 설정, 그래도 없으면 NotFound
			$selectedModel = model_list.find((model) => model.status === 'loaded') ?? model_list[0];
			$isModel_loaded = true;
		} catch (error) {
			// $selectedModel = 'NotFound';
			// 애초에 버튼이 비활되긴하지만 혹시 몰라서 모델 리스트에 실패 메시지라도 넣어줌
			model_list.push({
				id: 'NotFound',
				name: '모델 리스트업 실패',
				desc: '서버에서 모델 정보를 받아오지 못했습니다.'
			} as ModelInfo);
			axios
				.post(`${PUBLIC_API_URL}/auto_report/try_catch`, {
					error: `모델 리스트업 실패: ${error}`,
					timestamp: new Date().toISOString()
				})
				.catch((err) => {
					console.error('레전드 버그가 나버림', err);
				});
			// 모델 리스트가 비어있거나 예상치 못한 형식일 경우 대비
		}
	}

	let chat_body: HTMLDivElement;
	// 안봐도 나중에 최적화가 필요한 WWW
	// 인풋에도 해당 기능 주기
	$effect(() => {
		// messages 배열의 내용이 바뀌는 것을 Svelte가 감지합니다.
		MsgBox.map((m) => m.content);
		if (chat_body) {
			// 화면이 실제 업데이트될 때까지 아주 잠시(tick) 기다린 후 스크롤
			tick().then(() => {
				chat_body.scrollTo({
					top: chat_body.scrollHeight,
					behavior: 'smooth' // 부드럽게 스크롤 (원치 않으면 'auto')
				});
			});
		}
	});

	// 작동은 하는데 뭔지 못알아 처먹었으니 공부하기 대충 백앤드에 요청 때리고 응답 바디에 리더걸고 와일로 반복 수정하는거 같은데, 소켓이 더 나은건 아닌지 고민 ㄱ
	async function chat() {
		// 빈채팅이거나, 모델이 응답중이면 씹기
		if (user_input.trim() === '' || isModelResponding) return; // 빈 입력 방지
		isModelResponding = true; // 모델이 응답 중임을 표시
		// 1. 유저 메시지 추가
		const currentInput = user_input;

		//crypto.randomUUID() 이유는 몰라도 개발자 모드 호스팅으로 여는순간 안됌, 임시로 랜덤숫자
		let user_chat_id = (Math.floor(Math.random() * 1000) + 1).toString();
		let ai_chat_id = (Math.floor(Math.random() * 1000) + 1).toString();

		MsgBox = [...MsgBox, { id: user_chat_id, sender: 'user', content: currentInput }];
		user_input = '';

		// 2. AI 메시지 공간 미리 생성 (빈 내용으로 추가)
		// 이 시점에서 MsgBox의 마지막 인덱스가 AI의 메시지 위치가 됩니다.
		MsgBox = [...MsgBox, { id: ai_chat_id, sender: 'assistant', content: '' }];
		// 나중에 모델의 응답ID는 어떻게 넘길지 고려하기, ID생성을 백엔드에서 하고 프론트에서 로드만 하던가 < 그럼 챗 분류는? 차차해라
		const aiMsgIndex = MsgBox.length - 1;
		const response = await fetch(`${PUBLIC_API_URL}/chat`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				id: user_chat_id,
				chat: currentInput,
				model: $selectedModel.id,
				// 나중에 사이드메뉴에서 커스텀노트, 이미지 URL같이 다른 옵션 추가하기
				custom_note: '',
				logic_plus: $logic_plus
			})
		});

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();

		if (!reader) return;

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			for (const line of decoder.decode(value)) {
				try {
					// 응답정보는 나중에 추가할거면 하고 아님 말고 (EX TPS, Total_Tokens, Start_in)
					MsgBox[aiMsgIndex].content += line;
					MsgBox = [...MsgBox];
				} catch (e) {
					console.log(e);
					continue;
				}
			}
		}
		isModelResponding = false; // 모델 응답 완료 표시
	}
	function handleGlobalKeyDown(event: KeyboardEvent) {
		// 쉬프트 엔터면 패스하기
		if (event.key === 'Enter' && !event.shiftKey) {
			chat();
			event.preventDefault();
		}
	}
	function open_model_menu() {
		$isModel_menu_open = !$isModel_menu_open;
	}
</script>

<!-- 어디든엔터라면채팅을넣어 -->
<svelte:window on:keydown={handleGlobalKeyDown} />

<div id="main">
	<div id="header">
		<div id="header_left">
			<BackBtn />
			<div id="title">TODO리스트는아직인가요?</div>
		</div>
		<div id="header_right">
			{#await model_listup()}
				<button id="model_menu_btn" disabled>Loading...</button>
			{:then}
				<button id="model_menu_btn" onclick={open_model_menu}>{$selectedModel.name}</button>
			{/await}
			<button
				title=""
				id="force_menu"
				onclick={() => ($isModel_menu_open = false)}
				class:disable={$isModel_menu_open}
			></button>
			{#if $isModel_menu_open}
				<ModelListMenu {model_list} {model_listup} />
			{/if}

			<HamMenu />

			<!-- <button id="side_menu" onclick={alert("menu")}></button> -->
		</div>
	</div>
	<div id="chat_body" bind:this={chat_body}>
		{#each MsgBox as msg (msg.id)}
			<!-- 잠깐만 구분선용으로 쓰기 -->
			<div style="opacity: 0.5; font-size: 0.8rem; font-weight: bold;">[{msg.sender}]</div>
			{@html marked(DOMPurify.sanitize(msg.content))}
			<!-- 비정제 HTML marked가 스타일링함 -->

			<!-- {msg.content} -->

			<!-- 테스트용 -->
			<!-- {msg.content} -->
			<!-- {@html msg.content} -->
		{/each}
	</div>
	<div id="chat_input">
		{#if $isModel_loaded}
			<textarea id="user_input" placeholder="텍스트 입력" bind:value={user_input}></textarea>
		{:else}
			<textarea id="user_input" placeholder="불러오는중..." bind:value={user_input}></textarea>
		{/if}
		<ChatTools {user_input} {chat} {isModelResponding} />
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

	@media (orientation: portrait) {
		#chat_input {
			width: 90dvw;
			margin-bottom: 0;
			border-bottom: 0;
			border-radius: 0.5rem 0.5rem 0 0;
			bottom: 0;
		}
	}
</style>
