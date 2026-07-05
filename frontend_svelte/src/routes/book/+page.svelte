<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import { chatState } from '$lib/states/chat.svelte';
	import { pageState } from '$lib/states/menus.svelte';
	import '$lib/assets/chat_body.css';

	onMount(() => {
		modelsState.loadModels();
		chatState.loadHistory();
	});

	let book_title = $state('테스트북123MKii-Alpha');

	import ModelListMenu from '$components/ModelListMenu.svelte';
	import BackBtn from '$components/BackBtn.svelte';
	import HamMenu from '$components/HamMenu.svelte';
	import ChatTools from '$components/ChatTools.svelte';
	import ChatBlock from '$components/ChatBlock.svelte';
	import ToastContainer from '$components/Common/ToastContainer.svelte';

	let isDesktopMode = $state(false);
	onMount(() => {
		isDesktopMode = window.matchMedia('(pointer: fine)').matches;
	});

	let chat_body: HTMLDivElement;

	$effect(() => {
		chatState.list.map((m) => m.content);
		if (chat_body) {
			tick().then(() => {
				chat_body.scrollTo({
					top: chat_body.scrollHeight,
					behavior: 'smooth'
				});
			});
		}
	});

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
<svelte:window on:keydown={handleGlobalKeyDown} />

<ToastContainer />

<div class="app-layout">
	<!-- Header -->
	<header class="header">
		<div class="header-left">
			<BackBtn />
			<h1 class="book-title">{book_title}</h1>
		</div>
		<div class="header-right">
			{#if modelsState.isLoading}
				<button class="model-btn" disabled aria-label="모델 로딩중">
					<span class="loading-dots">
						<span></span>
						<span></span>
						<span></span>
					</span>
				</button>
			{:else}
				<button class="model-btn" onclick={toggle_model_menu}>
					<span class="model-icon">◈</span>
					<span class="model-name">{modelsState.selectedModel?.name || '모델 선택'}</span>
				</button>
			{/if}

			<HamMenu />
		</div>
	</header>

	<!-- Model Menu - rendered at root level -->
	{#if pageState.isModel_menu_open}
		<ModelListMenu />
	{/if}

	<!-- Chat Body -->
	<div class="chat-body" bind:this={chat_body}>
		{#each chatState.list as msg (msg.id)}
			<ChatBlock
				text={msg.content}
				live_token={msg.live_token}
				sender={msg.sender}
				isResponding={chatState.isModelResponding &&
					msg === chatState.list[chatState.list.length - 1]}
			/>
		{/each}
	</div>

	<!-- Input Area -->
	<div class="input-area">
		<div class="input-wrapper">
			{#if modelsState.isLoading}
				<textarea class="user-input" placeholder="불러오는중..." disabled></textarea>
			{:else}
				<textarea
					class="user-input"
					placeholder="메시지를 입력하세요..."
					autocomplete="off"
					bind:value={chatState.user_input}
					rows={1}
				></textarea>
			{/if}
		</div>
		<ChatTools />
	</div>
</div>

<style>
	/* Layout */
	.app-layout {
		width: 100dvw;
		height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg-primary);
		overflow: hidden;
	}

	/* Header */
	.header {
		height: var(--header-height);
		padding: 0 var(--space-md);
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		backdrop-filter: blur(10px);
		flex-shrink: 0;
		z-index: 100;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-width: 0;
		flex: 1;
	}

	.book-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
		min-width: 0;
		flex-shrink: 1;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		flex-shrink: 0;
	}

	/* Model Button */
	.model-btn {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		transition: all var(--transition-fast);
		white-space: nowrap;
		flex-shrink: 0;
		max-width: 14rem;
	}

	.model-btn:hover:not(:disabled) {
		background: var(--color-bg-hover);
		border-color: var(--color-accent-primary);
	}

	.model-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.model-icon {
		color: var(--color-accent-primary);
		font-size: var(--font-size-sm);
	}

	/* 엣지 케이스지만, 모델이름이 너무너무너무 길면 제목을 잡아먹음, 멕스치를 정할지 고민하기 */
	.model-name {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Loading Dots */
	.loading-dots {
		display: flex;
		gap: 3px;
	}
	.loading-dots span {
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--color-accent-primary);
		animation: loadingDot 1.4s ease-in-out infinite;
	}
	.loading-dots span:nth-child(2) {
		animation-delay: 0.2s;
	}
	.loading-dots span:nth-child(3) {
		animation-delay: 0.4s;
	}
	@keyframes loadingDot {
		0%,
		80%,
		100% {
			transform: scale(0.6);
			opacity: 0.4;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Overlay - removed, now in ModelListMenu */

	/* Chat Body */
	.chat-body {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		padding: var(--space-md);
		gap: var(--space-sm);
		min-height: 0;
		scroll-behavior: smooth;
	}

	/* Input Area */
	.input-area {
		padding: var(--space-sm) var(--space-md) var(--space-md);
		border-top: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		flex-shrink: 0;
	}

	.input-wrapper {
		margin-bottom: var(--space-sm);
	}

	.user-input {
		width: 100%;
		min-height: 60px;
		max-height: 15rem;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		color: var(--color-text-primary);
		font-family: var(--font-family);
		font-size: var(--font-size-base);
		resize: none;
		outline: none;
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
		line-height: 1.5;
	}

	.user-input:focus {
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 3px var(--color-accent-glow);
	}

	.user-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.user-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Mobile */
	@media (max-width: 640px) {
		.header {
			height: 3rem;
			padding: 0 var(--space-sm);
		}

		.book-title {
			font-size: var(--font-size-base);
			max-width: 50vw;
		}

		.chat-body {
			padding: var(--space-sm);
		}

		.input-area {
			padding: var(--space-xs) var(--space-sm) var(--space-sm);
		}

		.user-input {
			min-height: 2.2rem;
			font-size: var(--font-size-sm);
		}
	}
</style>
