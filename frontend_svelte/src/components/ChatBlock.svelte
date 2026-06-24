<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	let { text, live_token } = $props<{
		text: string;
		live_token: number;
	}>();
	let cleanHtml = $derived(DOMPurify.sanitize(text));
</script>

<!-- 유저챗은 토큰이 없으니 if사용, 아니면 인풋토큰을 이걸로 받던가 -->
{#if live_token}
	<div id="live_token">{live_token} tokens</div>
{/if}

<div id="panel">
	{@html marked(cleanHtml)}
</div>

<style>
	#live_token {
		font-size: 0.75rem;
		opacity: 0.5;
	}
	#panel {
	}
</style>
