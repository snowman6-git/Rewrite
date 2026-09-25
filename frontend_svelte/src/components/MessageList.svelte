<script lang="ts">
	import { tick } from 'svelte';
	import { chatState } from '$lib/states/chat.svelte';
	import ChatBlock from '$components/ChatBlock.svelte';
	import '$lib/assets/chat_body.css';

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
</script>

<div class="chat-body" bind:this={chat_body}>
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

<style>
	@media (max-width: 640px) {
		.chat-body {
			padding: var(--space-sm);
		}
	}
</style>
