<script lang="ts">
	import { chatState } from '$lib/states/chat.svelte';
	import MinMaxPercent from './MinMaxPercent.svelte';
	import { memoryTools } from '$lib/states/memory.svelte';
	import { modelsState } from '$lib/states/models.svelte';
</script>

<div class="chat-tools">
	<!-- Logic+ 토글 -->
	<button
		class="logic-plus-btn"
		class:active={chatState.logic_plus}
		onclick={() => (chatState.logic_plus = !chatState.logic_plus)}
		aria-pressed={chatState.logic_plus}
		aria-label="Logic+ 토글"
	>
		<span class="logic-plus-icon"></span>
	</button>

	<!-- 메모리 바 -->
	<!-- <div class="mem-bar">
		<MinMaxPercent
			class="mem-percent"
			min={memoryTools.safeMemoryUsage}
			max={memoryTools.safeContextSize}
		/>
		<progress
			class="mem-progress"
			value={memoryTools.safeMemoryUsage}
			max={memoryTools.safeContextSize}
		></progress>
	</div> -->

	<!-- 전송 버튼 -->
	<button
		class="send-btn"
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
		justify-content: space-between;
		width: 100%;
		padding: var(--space-xs) 0;
		gap: var(--space-sm);
	}

	/* ---------- Logic+ ---------- */
	.logic-plus-btn {
		width: 2.25rem;
		height: 2.25rem;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1.5px solid var(--color-border);
		border-radius: 50%;
		background: var(--color-bg-tertiary);
		color: var(--color-text-secondary);
		transition: all var(--transition-fast);
	}

	.logic-plus-btn:hover:not(:disabled) {
		border-color: var(--color-text-tertiary);
		background: var(--color-bg-hover);
	}

	.logic-plus-btn.active {
		border-color: var(--color-accent-primary);
		color: var(--color-accent-primary);
		background: var(--color-accent-glow);
		box-shadow: var(--shadow-glow);
	}

	.logic-plus-icon {
		width: 1rem;
		height: 1rem;
		background-image: url('../lib/assets/logic_plus.svg');
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
	}

	/* ---------- Memory Bar ---------- */
	.mem-bar {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		min-width: 0;
	}

	.mem-progress {
		flex: 1;
		height: 4px;
		border-radius: var(--radius-full);
		overflow: hidden;
		background: var(--color-bg-elevated);
		border: none;
		appearance: none;
		-webkit-appearance: none;
	}

	.mem-progress::-webkit-progress-bar {
		background: var(--color-bg-elevated);
		border-radius: var(--radius-full);
	}

	.mem-progress::-webkit-progress-value {
		background: var(--color-accent-gradient);
		border-radius: var(--radius-full);
		transition: width var(--transition-base);
	}

	.mem-progress::-moz-progress-bar {
		background: var(--color-accent-gradient);
		border-radius: var(--radius-full);
	}

	/* ---------- Send Button ---------- */
	.send-btn {
		width: 2.25rem;
		height: 2.25rem;
		flex-shrink: 0;
		border-radius: 50%;
		border: 1.5px solid var(--color-border);
		background: var(--color-bg-tertiary);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
		opacity: 0.4;
	}

	.send-btn:hover:not(:disabled) {
		border-color: var(--color-accent-primary);
		background: var(--color-accent-glow);
		opacity: 0.8;
	}

	.send-btn.active {
		opacity: 1;
		border-color: var(--color-accent-primary);
		background: var(--color-accent-primary);
		box-shadow: 0 0 12px var(--color-accent-glow);
	}

	.send-btn.active:hover {
		background: var(--color-accent-secondary);
		border-color: var(--color-accent-secondary);
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
		filter: brightness(0) invert(1);
	}

	/* ---------- Mobile ---------- */
	@media (max-width: 640px) {
		.chat-tools {
			padding: var(--space-xs) 0;
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
