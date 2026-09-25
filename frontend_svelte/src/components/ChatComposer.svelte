<script lang="ts">
	import { modelsState } from '$lib/states/models.svelte';
	import { chatState } from '$lib/states/chat.svelte';
	import ChatTools from '$components/ChatTools.svelte';

	// 그립 드래그로 높이를 잡는다 — 값만 유지(페이지 리로드 시 초기화)
	let taEl: HTMLTextAreaElement;
	let height = $state('');
	let dragging = false;
	let startY = 0;
	let startH = 0;

	function onGripDown(e: PointerEvent) {
		e.preventDefault();
		dragging = true;
		startY = e.clientY;
		startH = taEl.offsetHeight;
		const move = (ev: PointerEvent) => {
			if (!dragging) return;
			const next = startH + startY - ev.clientY;
			height = `${Math.min(Math.max(next, 40), Math.floor(window.innerHeight * 0.6))}px`;
		};
		const up = () => {
			dragging = false;
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
	}
</script>

<div class="input-area">
	<div class="composer-row">
	<div class="input-wrapper">
		{#if modelsState.isLoading}
			<textarea class="user-input" placeholder="불러오는중..." rows={1} disabled></textarea>
		{:else}
			<textarea
				class="user-input"
				style:height={height}
				placeholder="메시지를 입력하세요..."
				autocomplete="off"
				bind:value={chatState.user_input}
				bind:this={taEl}
				rows={1}
			></textarea>
			<div
				class="resize-grip"
				role="separator"
				aria-orientation="horizontal"
				onpointerdown={onGripDown}
				title="잡아서 높이를 조절"
				aria-label="입력창 높이 조절"
			></div>
		{/if}
	</div>
		<div class="composer-side">
			<ChatTools />
		</div>
	</div>
</div>

<style>
	.input-area {
		/* 인풋 휴일 높이 — textarea min-height와 버튼 컬럼 높이의 단일 소스 */
		--input-rest-h: 60px;
		padding: var(--space-sm) var(--space-md) var(--space-md);
		flex-shrink: 0;
	}

	.composer-row {
		display: flex;
		align-items: stretch;
		gap: var(--space-sm);
	}

	.input-wrapper {
		position: relative;
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.composer-side {
		flex-shrink: 0;
		align-self: flex-end;
		/* 휴일 높이로 고정 + 중앙 → 확장 시에도 버튼 절대 위치 불변 (마구린 오프셋 없음) */
		height: calc(var(--input-rest-h) + 2px);
		display: flex;
		align-items: center;
	}

	.user-input {
		width: 100%;
		min-height: var(--input-rest-h);
		max-height: 60vh;
		overflow-y: auto;
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

	.resize-grip {
		position: absolute;
		top: -15px;
		left: 50%;
		transform: translateX(-50%);
		width: 32px;
		height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: ns-resize;
		touch-action: none;
		z-index: 1;
	}

	.resize-grip::after {
		content: '';
		width: 20px;
		height: 3px;
		border-radius: 2px;
		background: var(--color-border);
		transition: background var(--transition-fast);
	}

	.resize-grip:hover::after,
	.resize-grip:active::after {
		background: var(--color-text-tertiary);
	}

	@media (max-width: 640px) {
		.input-area {
			--input-rest-h: 2.2rem;
			padding: var(--space-xs) var(--space-sm) var(--space-sm);
		}

		.composer-side {
			height: calc(var(--input-rest-h) + 2px);
		}

		.user-input {
			min-height: 2.2rem;
			font-size: var(--font-size-sm);
		}
	}
</style>
