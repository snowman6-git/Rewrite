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
	{#each chatState.list as msg (msg.pid)}
		<ChatBlock
			text={msg.content}
			live_token={msg.live_token}
			sender={msg.sender}
			isResponding={chatState.isModelResponding &&
				msg === chatState.list[chatState.list.length - 1]}
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
