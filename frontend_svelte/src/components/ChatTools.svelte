<script lang="ts">
	import { chatState } from '$lib/states/chat.svelte';
</script>

<div class="chat-tools">
	<!-- Logic+ 토글 -->
	<button
		class="logic-plus-btn icon-btn"
		class:active={chatState.logic_plus}
		onclick={() => (chatState.logic_plus = !chatState.logic_plus)}
		aria-pressed={chatState.logic_plus}
		aria-label="Logic+ 토글"
	>
		<span class="logic-plus-icon"></span>
	</button>

	<!-- 메모리 바 (사용 안 함) -->
	<!-- <div class="mem-bar">
		<MinMaxPercent
			class="mem-percent"
			min={memoryTools.safeMemoryUsage}
			max={memoryTools.safeContextSize}
		/>
		<progress
			class="progress-bar"
			value={memoryTools.safeMemoryUsage}
			max={memoryTools.safeContextSize}
		></progress>
	</div> -->

	<!-- 전송 버튼 -->
	<button
		class="send-btn icon-btn"
		class:active={chatState.user_input.trim() !== '' && !chatState.isModelResponding}
		disabled={chatState.isModelResponding}
		aria-label="전송"
		onclick={() => chatState.sendMessage()}
	>
		<span class="send-icon"></span>
	</button>
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

	.logic-plus-icon {
		width: 1rem;
		height: 1rem;
		background-image: url('../lib/assets/logic_plus.svg');
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
	}

	/* ---------- Send Button ---------- */
	.send-btn {
		opacity: 0.4;
	}

	.send-btn.active {
		opacity: 1;
		border-color: var(--color-bg-primary);
		background: var(--color-accent-primary);
	}

	.send-btn.active:hover {
		background: var(--color-accent-secondary);
		border-color: var(--color-bg-primary);
	}

	.send-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.send-icon {
		width: 1rem;
		height: 1rem;
		background-image: url('../lib/assets/pen.svg');
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
		filter: brightness(0) invert(1);
		transition: filter var(--transition-fast);
	}

	.send-btn.active .send-icon {
		filter: brightness(0);
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

		.logic-plus-icon {
			width: 0.85rem;
			height: 0.85rem;
		}

		.send-btn {
			width: 2rem;
			height: 2rem;
		}

		.send-icon {
			width: 0.85rem;
			height: 0.85rem;
		}
	}
</style>
