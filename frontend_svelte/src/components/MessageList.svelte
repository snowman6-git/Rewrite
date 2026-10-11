<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import { tick } from 'svelte';
	import { chatState } from '$lib/states/chat.svelte';
	import ChatBlock from '$components/ChatBlock.svelte';
	import Modal from '$components/Common/Modal.svelte';
	import Icon from '$components/Common/Icon.svelte';
	import EmptyState from '$components/Common/EmptyState.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { bookmarkState } from '$lib/states/bookmarks.svelte';
	import '$lib/assets/chat_body.css';

	let chat_body: HTMLDivElement;

	// 세션 진입 시 한 번만 최하단. 그 뒤 메시지 수신엔 안 밀림 (읽는 사람 존중)
	let firstEntryDone = false;
	$effect(() => {
		chatState.list.map((m) => m.content);
		if (!firstEntryDone && chatState.list.length > 0) {
			firstEntryDone = true;
			tick().then(() => {
				if (chat_body) chat_body.scrollTo({ top: chat_body.scrollHeight });
			});
		}
	});

	// 최하단에서 120px 이상 올라와 있으면 점프 버튼 노출
	let showJump = $state(false);
	// 최상단에서 120px 이상 내려오면 맨 위로 버튼 노출
	let showTop = $state(false);
	function onScroll() {
		if (!chat_body) return;
		showJump = chat_body.scrollHeight - chat_body.scrollTop - chat_body.clientHeight > 120;
		showTop = chat_body.scrollTop > 120;
	}

	function jumpToBottom() {
		if (!chat_body) return;
		// .chat-body에 scroll-behavior:smooth → 4만px급 거리는 스무스가 1초 넘게 걸린다. 점프는 즉시.
		// behavior:'auto'는 CSS 값을 따르므로 'instant'로 명시해야 즉시 이동한다.
		chat_body.scrollTo({ top: chat_body.scrollHeight, behavior: 'instant' });
	}

	function jumpToTop() {
		if (!chat_body) return;
		chat_body.scrollTo({ top: 0, behavior: 'instant' });
	}

	// ---------- 책갈피 점프 ----------
	// 화면 윈도우(최근 50건) 밖의 pid는 지금机制로 못 간다 — 백엔드 앵커 요구는 doc/bookmark-jump-doc.md
	let flashPid = $state<string | null>(null);
	$effect(() => {
		const pid = chatState.jumpPid;
		if (!pid) return;
		tick().then(() => {
			const row = chat_body?.querySelector<HTMLElement>(`[data-pid="${CSS.escape(pid)}"]`);
			chatState.jumpPid = null;
			if (!row) {
				toast.error('책갈피 대상이 화면에 없습니다. (윈도우 밖 — 백엔드 앵커 요구 미구현)');
				return;
			}
			row.scrollIntoView({ block: 'start', behavior: 'instant' });
			flashPid = pid;
			setTimeout(() => {
				if (flashPid === pid) flashPid = null;
			}, 1200);
		});
	});

	// ---------- 멀티삭제 ----------
	let selectMode = $state(false);
	let selected = new SvelteSet<string>();
	let deleting = $state(false);
	let showConfirm = $state(false);

	//Esc: 선택모드 종료 (확인 다이얼로그가 열려 있으면 Modal 자체가 처리)
	function onWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && selectMode && !showConfirm) exitSelect();
	}

	function enterSelectWith(pid: string) {
		selected.clear();
		selected.add(pid);
		selectMode = true;
	}
	function exitSelect() {
		selectMode = false;
		selected.clear();
	}
	function toggleSelect(pid: string) {
		if (selected.has(pid)) selected.delete(pid);
		else selected.add(pid);
	}
	function onRowKey(e: KeyboardEvent, pid: string) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleSelect(pid);
		}
	}
	// shortcut: tabindex는 선택모드에서만 0. 분석기가 조건부 role을 못 봐 a11y 경고를 낸다(실동작은 정상)
	function requestDelete() {
		if (selected.size === 0 || deleting) return;
		showConfirm = true;
	}
	async function confirmDelete() {
		if (deleting) return;
		showConfirm = false;
		deleting = true;
		await chatState.deleteMany([...selected]);
		deleting = false;
		exitSelect();
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

<div class="chat-wrap">
	<div class="chat-body" class:select-mode={selectMode} bind:this={chat_body} onscroll={onScroll}>
		{#if chatState.list.length >= 50}
			<!-- 백엔드 ReadBook.chat은 50건 윈도우(LIMIT 50 OFFSET 앵커)만 반환한다 → 이전 대화는 이 화면에 없다 -->
			<p class="window-note">
				최근 50건만 표시됨 — 이전 대화는 백엔드가 페이지 분할을 지원해야 볼 수 있어요.
			</p>
		{/if}
		{#each chatState.list as msg, i (msg.pid)}
			<div
				class="msg-row"
				class:flash={flashPid === msg.pid}
				data-pid={msg.pid}
				class:select-mode={selectMode}
				class:is-selected={selectMode && selected.has(msg.pid)}
				role={selectMode ? 'checkbox' : undefined}
				aria-checked={selectMode ? selected.has(msg.pid) : undefined}
				tabindex={selectMode ? 0 : -1}
				onclick={selectMode ? () => toggleSelect(msg.pid) : undefined}
				onkeydown={selectMode ? (e) => onRowKey(e, msg.pid) : undefined}
			>
				<div class="block-shield" class:shielded={selectMode}>
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
						//삭제 메뉴: 선택모드 진입(해 메시지预选)
						remove={() => enterSelectWith(msg.pid)}
						edit={(content) => chatState.editAt(i, content)}
						bookmark={() => bookmarkState.toggle(msg.pid, msg.content)}
						isBookmarked={bookmarkState.has(msg.pid)}
					/>
				</div>
				{#if selectMode}
					<span class="sel-check" aria-hidden="true">
						<Icon name="check" size={12} />
					</span>
				{/if}
			</div>
		{/each}
		{#if chatState.list.length === 0}
			<!-- 로딩과 빈 책을 구분해 보여준다 (둘 다 list가 비어 있어 구분이 필요함) -->
			{#if chatState.historyPending}
				<EmptyState text="대화 불러오는중..." hint="서버에서 이 책의 대화를 가져오는 중입니다" />
			{:else}
				<EmptyState text="아직 대화가 없습니다" hint="입력창에 첫 장면을 적어 시작하세요" />
			{/if}
		{/if}
	</div>

	<!-- 선택 모드 하단 바: models 메뉴와 같은 하단 시트 언어 (오버레이 없음 — 채팅 탭=선택이어야 하므로) -->
	{#if selectMode}
		<div class="select-bar" class:busy={deleting} role="toolbar" aria-label="메시지 선택 도구">
			<span class="sel-count">{deleting ? '삭제중…' : `${selected.size}건 선택`}</span>
			<div class="sel-actions">
				<button
					class="sel-delete"
					disabled={selected.size === 0 || deleting}
					onclick={requestDelete}
					aria-label="선택한 메시지 삭제"
				>
					{#if deleting}<span class="sel-spin" aria-hidden="true"></span>{:else}<Icon
							name="trash"
							size={16}
						/>{/if}
					삭제
				</button>
				<button class="sel-cancel" disabled={deleting} onclick={exitSelect} aria-label="선택 취소">
					<Icon name="x" size={16} />
					취소
				</button>
			</div>
		</div>
	{/if}

	{#if showConfirm}
		<Modal
			title="메시지 삭제"
			message={`선택한 ${selected.size}건의 메시지를 삭제하시겠습니까?`}
			variant="danger"
			confirmText="삭제"
			cancelText="취소"
			onConfirm={confirmDelete}
			onCancel={() => (showConfirm = false)}
		/>
	{/if}

	<button
		class="jump-btn"
		class:hidden={!showJump || selectMode}
		onclick={jumpToBottom}
		aria-label="최신 메시지로 이동"
		title="최신 메시지로 이동"
	>
		<Icon name="chevron-down" size={18} />
	</button>

	<button
		class="jump-btn to-top"
		class:hidden={!showTop || selectMode}
		class:stacked={showJump}
		onclick={jumpToTop}
		aria-label="맨 위로 이동"
		title="맨 위로 이동"
	>
		<Icon name="chevron-up" size={18} />
	</button>
</div>

<style>
	.chat-wrap {
		position: relative;
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		min-width: 0;
	}

	/* ---------- 선택 모드 행: 코너 체크 + 실선 보더 ---------- */
	.msg-row {
		position: relative;
		width: 100%; /* flex shrink-to-fit 방지: .chat-body가 align-items:flex-start이라 명시적 폭 필요 */
	}

	/* 책갈피 점프 도착 표시 — 테마는 모노크롬이라 배경 한 번만 */
	.msg-row.flash {
		animation: row-flash 1.2s ease-out;
		border-radius: var(--radius-md);
	}

	@keyframes row-flash {
		0% {
			background: var(--color-bg-hover);
		}

		100% {
			background: transparent;
		}
	}

	/* 같은 이유: 빈 상태 카드도 내용 폭으로 수축하지 않게 전폭 */
	.chat-body :global(.empty-state) {
		width: 100%;
	}
	.msg-row.select-mode {
		cursor: pointer;
		border-radius: var(--radius-md);
		transition: opacity var(--transition-fast);
	}

	.msg-row.select-mode:active,
	.msg-row.select-mode:focus-visible {
		outline: 1px dashed var(--color-border-strong, var(--color-border));
	}

	.msg-row.select-mode .block-shield.shielded {
		pointer-events: none;
		opacity: 0.55;
	}

	/* 선택: 실선 보더 이펙트 */
	.msg-row.is-selected {
		outline: 1px solid var(--color-accent-primary);
	}

	.msg-row.is-selected .block-shield.shielded {
		opacity: 1;
	}

	/* 둥근 체크박스: 버블 상단-좌측 코너 안쪽 (스크롤 컨테이너 클리핑 회피) */
	.sel-check {
		position: absolute;
		left: 0.2rem;
		top: 0.2rem;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 50%;
		border: 1px solid var(--color-border);
		background: var(--color-bg-elevated);
		color: transparent;
		transition: all var(--transition-fast);
		pointer-events: none;
	}

	.msg-row.is-selected .sel-check {
		background: var(--color-accent-primary);
		border-color: var(--color-accent-primary);
		color: var(--color-text-inverse);
	}

	/* ---------- 선택 모드 하단 바: models 메뉴와 같은 하단 시트 ---------- */
	.select-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md) calc(var(--space-sm) + env(safe-area-inset-bottom));
		border: 0.15rem solid var(--color-accent-primary);
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		border-bottom: none;
		background: var(--color-bg-tertiary);
	}

	.select-bar.busy {
		opacity: 0.85;
	}

	.sel-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		white-space: nowrap;
	}

	.sel-actions {
		display: flex;
		gap: var(--space-xs);
	}

	.select-bar button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		min-height: 2.75rem;
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		font-family: inherit;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	@media (hover: hover) {
		.select-bar button:hover:not(:disabled) {
			background: var(--color-bg-elevated);
		}
	}

	.sel-delete {
		border-color: var(--color-error);
		color: var(--color-error);
	}

	@media (hover: hover) {
		.sel-delete:hover:not(:disabled) {
			background: color-mix(in srgb, var(--color-error) 10%, transparent);
		}
	}

	.select-bar button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.sel-spin {
		width: 0.8rem;
		height: 0.8rem;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-error);
		border-radius: 50%;
		animation: selSpin 0.6s linear infinite;
	}

	@keyframes selSpin {
		to {
			transform: rotate(360deg);
		}
	}

	/* 바 뒤에 마지막 메시지 가림 방지 */
	.chat-body.select-mode {
		padding-bottom: 5.5rem;
	}

	/* ---------- 점프 버튼 ---------- */
	.jump-btn {
		position: absolute;
		right: var(--space-md);
		/* 인풋 오버레이(104px) 위 — 그립과 4px 간격 (112px에서 4px만 내림) */
		bottom: calc(6.5rem + 4px);
		display: flex;
		align-items: center;
		justify-content: center;
		/* px 고정 — UI 배율 슬라이더가 rem을 줄여도 버튼은 안 줄어든다 */
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background: var(--color-bg-elevated);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		z-index: 5;
	}

	@media (hover: hover) {
		.jump-btn:hover {
			border-color: var(--color-accent-primary);
			color: var(--color-text-primary);
		}
	}

	.jump-btn.hidden {
		display: none;
	}

	/* 맨 위로: 기본은 최하단 자리, 아래 버튼이 같이 보일 때만 그 위로 쌓는다 (간격 8px) */
	.jump-btn.to-top {
		bottom: calc(6.5rem + 4px);
	}

	.jump-btn.to-top.stacked {
		bottom: calc(6.5rem + 4px + 36px + 8px);
	}

	@media (max-width: 640px) {
		.chat-body {
			padding: var(--space-sm);
			padding-bottom: 6.5rem; /* 전역(chat_body.css)과 동일 — 스코프 규칙이 shorthand로 덮어씀 */
		}
	}
</style>
