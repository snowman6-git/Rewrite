<script lang="ts">
	import { modelsState } from '$lib/states/models.svelte';
	import { chatState } from '$lib/states/chat.svelte';
	import ChatTools from '$components/ChatTools.svelte';
</script>

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

<style>
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

	@media (max-width: 640px) {
		.input-area {
			padding: var(--space-xs) var(--space-sm) var(--space-sm);
		}

		.user-input {
			min-height: 2.2rem;
			font-size: var(--font-size-sm);
		}
	}
</style>
