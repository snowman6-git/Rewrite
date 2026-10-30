<script lang="ts">
	import Icon from '$components/Common/Icon.svelte';
	import { chatState } from '$lib/states/chat.svelte';
</script>

<div class="chat-tools">
	<!-- Logic+ 토글 -->
	<button
		class="logic-plus-btn icon-btn"
		class:active={chatState.logic_plus}
		disabled={!chatState.ready}
		onclick={() => (chatState.logic_plus = !chatState.logic_plus)}
		aria-pressed={chatState.logic_plus}
		aria-label="Logic+ 토글"
	>
		<Icon name="plus" size={16} />
	</button>

	<!-- 메모리 바 (사용 안 함) -->

	<!-- 전송/정지 버튼: 응답 중 = 정지 (부분 내용 보존, 2026-11-01) -->
	{#if chatState.isModelResponding}
		<button class="send-btn stop-btn icon-btn" aria-label="스트림 정지" onclick={() => chatState.stopStream()}>
			<Icon name="stop" size={16} />
		</button>
	{:else}
		<!-- 빈 입력도 활성: 빈 전송 = 모델이 이어 쓰게 하는 "계속" (2026-10-30) -->
		<button
			class="send-btn icon-btn active"
			disabled={!chatState.ready}
			aria-label="전송 (빈 입력 시 계속)"
			onclick={() => chatState.sendMessage()}
		>
			<Icon name="edit" size={16} />
		</button>
	{/if}
</div>

<style>
	.chat-tools {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 0;
		gap: var(--space-sm);
		flex-shrink: 0;
	}

	/* ---------- Logic+ ---------- */
	.logic-plus-btn {
		transition: all var(--transition-fast);
	}

	.logic-plus-btn.active {
		border-color: var(--color-accent-primary);
		color: var(--color-accent-primary);
		background: var(--color-accent-glow);
	}

	/* ---------- Send Button ---------- */
	.send-btn {
		color: var(--color-text-primary);
		opacity: 0.4;
		transition: all var(--transition-fast);
	}

	.send-btn.active {
		color: var(--color-text-inverse);
		opacity: 1;
		border-color: var(--color-bg-primary);
		background: var(--color-accent-primary);
	}

	@media (hover: hover) {
		.send-btn.active:hover {
			background: var(--color-accent-secondary);
			border-color: var(--color-bg-primary);
		}
	}

	.send-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	/* 정지: 응답 중 항상 액티브 (pressable) */
	.stop-btn {
		color: var(--color-text-inverse);
		opacity: 1;
		border-color: var(--color-bg-primary);
		background: var(--color-accent-primary);
	}

	/* ---------- Mobile ---------- */
	@media (max-width: 640px) {
		.chat-tools {
			padding: 0;
		}

		.logic-plus-btn {
			width: 2rem;
			height: 2rem;
		}

		.send-btn {
			width: 2rem;
			height: 2rem;
		}
	}
</style>
