<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';

	let {
		text,
		live_token,
		sender = 'assistant',
		isResponding = false
	} = $props<{
		text: string;
		live_token?: number;
		sender?: string;
		isStreaming?: boolean;
		isResponding?: boolean;
	}>();

	let cleanHtml = $derived(DOMPurify.sanitize(text));
	let isStreaming = $derived(cleanHtml.length > 1);
	let isRespondingProp = $derived(isResponding);

	let loadingTexts = [
		'AI 가 이야기를 진행하는중...',
		'세계관 보면서 일어날 일 계산중...',
		'주변 인물들이 유저의 행동에 반응하는중...'
	];
	let currentTextIndex = $state(0);

	$effect(() => {
		const showLoading = sender === 'assistant' && isResponding && !isStreaming;
		if (!showLoading) {
			currentTextIndex = 0;
			return;
		}

		const id = setInterval(() => {
			currentTextIndex = (currentTextIndex + 1) % loadingTexts.length;
		}, 5000);
		return () => clearInterval(id);
	});
</script>

<div class="message-row {sender}">
	<div class="message-bubble {sender}">
		{#if isStreaming}
			<div class="markdown-content streaming">{@html marked.parse(cleanHtml) || '...'}</div>
		{:else}
			<div class="markdown-content">{@html marked.parse(cleanHtml)}</div>
		{/if}
		{#if sender === 'assistant' && isRespondingProp && !isStreaming}
			<div class="loading-indicator">
				<div class="loading-spinner"></div>
				<span class="loading-text">{loadingTexts[currentTextIndex]}</span>
			</div>
		{/if}
		{#if live_token && live_token > 0}
			<div class="token-info">
				<span class="token-dot"></span>
				{live_token} tokens
			</div>
		{/if}
	</div>
</div>

<style>
	.loading-indicator {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}

	.loading-spinner {
		width: 16px;
		height: 16px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	.loading-indicator .loading-text {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		margin-left: var(--space-xs);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 200px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
