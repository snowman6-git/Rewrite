<script lang="ts">
	import { modelsState } from '$lib/states/models.svelte';
	import { chatState } from '$lib/states/chat.svelte';
	import ChatTools from '$components/ChatTools.svelte';

	// 인풋 개방 = 채팅 히스토리가 왔고 모델이 선택된 상태 (Slow 3G 실측: 로딩 중 disabled + 52px 일정)
	const ready = $derived(chatState.historyPending === false && !!modelsState.selectedModel);

	// 그립 드래그로 높이를 잡는다 — 값만 유지(페이지 리로드 시 초기화)
	let taEl = $state<HTMLTextAreaElement | undefined>();
	let height = $state('');
	let dragging = false;
	let startY = 0;
	let startH = 0;

	function onGripDown(e: PointerEvent) {
		e.preventDefault();
		dragging = true;
		startY = e.clientY;
		startH = taEl?.offsetHeight ?? 0;
		const move = (ev: PointerEvent) => {
			if (!dragging) return;
			const next = startH + startY - ev.clientY;
			// 하한은 JS가 안 잡는다 — CSS min-height(라인 1개)가 클램프해서 휴일 높이까지 내려간다
			height = `${Math.min(Math.max(next, 0), Math.floor(window.innerHeight * 0.6))}px`;
		};
		const up = () => {
			dragging = false;
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', up);
			// 휴일 높이까지 줄면 인라인 높이를 지우고 CSS에 넘긴다 (40px 같은 옛 하한에 갇히지 않음)
			const min = taEl ? parseFloat(getComputedStyle(taEl).minHeight) || 0 : 0;
			if (taEl && taEl.offsetHeight <= Math.ceil(min)) height = '';
		};
		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', up);
	}
</script>

<div class="input-area">
	<div class="composer-box">
		<textarea
			class="user-input"
			name="chat-input"
			style:height
			placeholder={ready ? '메시지를 입력하세요...' : '불러오는중...'}
			autocomplete="off"
			bind:value={chatState.user_input}
			bind:this={taEl}
			rows={1}
			disabled={!ready}
		></textarea>
		<!-- 툴즈·그립은 로딩 중에도 렌더: 행 높이가 툴즈에서 나오므로 빠지면 패널이 12px 줄었다가 돌아온다 -->
		<div class="composer-tools">
			<ChatTools />
		</div>
		<div
			class="resize-grip"
			role="separator"
			aria-orientation="horizontal"
			onpointerdown={onGripDown}
			title="잡아서 높이를 조절"
			aria-label="입력창 높이 조절"
		></div>
	</div>
</div>

<style>
	.input-area {
		/* 채팅 위에 얹는 고정 레이어 — 크기는 인풋+툴즈에 맞춤 (.chat-body 하단 패딩이 이 높이만큼 비움) */
		position: absolute;
		left: var(--space-md);
		right: var(--space-md);
		bottom: var(--space-xl); /* 지금 위치 (하단에서 띄운 그대로) */
		width: auto;
		max-width: 100%;
		box-sizing: border-box;
		padding: var(
			--space-xs
		); /* 그립은 패널 바깥에 있으므로 패딩은 사방 동일 (그립 자리로 상단을 벌리지 않음) */
		background: var(--color-bg-secondary);
		/* 2px 테두리는 이 패널 하나에만 있다 (인풋·툴즈는 테두리 없음) */
		border: 2px solid var(--color-border-strong);
		/* radius-full 금지: 반지름은 항상 min(값, 높이/2)로 클램프돼서, 그립으로 늘리면 끝이 통째 반원이 된다 */
		border-radius: var(--radius-xl);
		transition:
			border-color var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.input-area:focus-within {
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px var(--color-accent-glow);
	}

	/* 안쪽 래퍼가 패딩의 유일한 출처 — 인풋·툴즈는 패딩을 받지 않는다 */
	.composer-box {
		position: relative;
		display: flex;
		align-items: center; /* 인풋 텍스트와 툴즈를 같은 기준선에서 중앙 정렬 */
		gap: var(--space-xs);
		padding: var(--space-2xs) var(--space-sm) var(--space-2xs) var(--space-md); /* 좌 16 / 우 8 / 세로 4 (툴즈 버튼 32px가 높이를 만들므로 세로는 얇게) */
		background: transparent;
	}

	/* 툴즈 — 인풋 우측 하단 (flex item, 절대위치 아님)
	   패딩·마진 없음: 1줄일 땐 행 높이가 버튼 높이라 center가 곧 중앙 정렬, 인풋을 늘리면 align-self:flex-end가 아래로 붙인다 */
	.composer-tools {
		flex-shrink: 0;
		display: flex;
		align-items: flex-end;
		align-self: flex-end;
	}

	.user-input {
		flex: 1;
		min-width: 0;
		width: 100%;
		/* 패딩 없음 — 간격은 .composer-box가 전부 담당, 높이는 라인 1개분만 */
		min-height: 1.5em;
		max-height: 60vh;
		overflow-y: auto;
		padding: 0;
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		font-size: var(--font-size-base);
		resize: none;
		outline: none;
		line-height: 1.5;
	}

	.resize-grip {
		position: absolute;
		top: -26px; /* 패널 바깥 유지 — 외곽 상단(테두리2+패딩4) 위에 4px 간격 (절반값 -13px는 패널과 9px 겹쳐서 폐기) */
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

	@media (hover: hover) {
		.resize-grip:hover::after {
			background: var(--color-text-tertiary);
		}
	}

	.resize-grip:active::after {
		background: var(--color-text-tertiary);
	}

	@media (max-width: 640px) {
		.input-area {
			padding: var(--space-2xs); /* 전역과 동일 (띄움은 bottom이 담당) */
		}

		.user-input {
			font-size: var(--font-size-sm);
		}
	}
</style>
