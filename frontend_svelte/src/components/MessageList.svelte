<script lang="ts">
	import { tick } from 'svelte';
	import { chatState } from '$lib/states/chat.svelte';
	import ChatBlock from '$components/ChatBlock.svelte';
	import Icon from '$components/Common/Icon.svelte';
	import '$lib/assets/chat_body.css';

	let chat_body: HTMLDivElement;

	// 세션 진입 시 한 번만 최하단. 그 뒤 메시지 수신엔 안 밀림 (읽는 사람 존중)
	let firstEntryDone = false;
	$effect(() => {
		chatState.list.map((m) => m.content);
		if (!firstEntryDone && chatState.list.length > 0) {
			firstEntryDone = true;
			tick().then(() => {
				if (chat_body) chat_body.scrollTo({ top: chat_body.scrollHeight });
			});
		}
	});

	// 최하단에서 120px 이상 올라와 있으면 점프 버튼 노출
	let showJump = $state(false);
	function onScroll() {
		if (!chat_body) return;
		showJump = chat_body.scrollHeight - chat_body.scrollTop - chat_body.clientHeight > 120;
	}

	function jumpToBottom() {
		if (!chat_body) return;
		chat_body.scrollTo({ top: chat_body.scrollHeight, behavior: 'smooth' });
	}
</script>

<div class="chat-wrap">
	<div class="chat-body" bind:this={chat_body} onscroll={onScroll}>
		{#each chatState.list as msg, i (msg.pid)}
			<ChatBlock
				text={msg.content}
				live_token={msg.live_token}
				sender={msg.sender}
				isResponding={chatState.isModelResponding && msg === chatState.list[i]}
				//재생성: 마지막 메시지이면서 AI(어시스턴트) 메시지만 전달
				onReload={msg.sender === 'assistant' && i === chatState.list.length - 1
					? () => chatState.reloadAt(i)
					: undefined}
				//삭제 메뉴 노출 조건: 채팅 목록 마지막 버블만
				isLast={i === chatState.list.length - 1}
				copy={() => chatState.copyAt(i)}
				remove={() => chatState.deleteAt(i)}
				edit={(content) => chatState.editMessage(i, content)}
			/>
		{/each}
	</div>
	<button
		class="jump-btn"
		class:hidden={!showJump}
		onclick={jumpToBottom}
		aria-label="최신 메시지로 이동"
		title="최신 메시지로 이동">
		<Icon name="chevron-down" size={18} />
	</button>
</div>

<style>
	.chat-wrap {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		min-width: 0;
	}

	.jump-btn {
		position: absolute;
		right: var(--space-md);
		bottom: var(--space-md);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-bg-elevated);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		z-index: 5;
	}

	.jump-btn:hover {
		border-color: var(--color-accent-primary);
		color: var(--color-text-primary);
	}

	.jump-btn.hidden {
		display: none;
	}

	@media (max-width: 640px) {
		.chat-body {
			padding: var(--space-sm);
		}
	}
</style>
