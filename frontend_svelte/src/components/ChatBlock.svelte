<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { readStreamFx, STREAM_FX_SETTLE_MS, type StreamFx } from '$lib/assets/stream-fx';
	import Sheet from '$components/Common/Sheet.svelte';
	import Icon from './Common/Icon.svelte';

	let {
		text,
		live_token,
		sender = 'assistant',
		isResponding = false,
		onReload,
		copy,
		remove,
		edit,
		bookmark,
		isBookmarked = false,
		isLast = false
	} = $props<{
		text: string;
		live_token?: number;
		sender?: string;
		isResponding?: boolean;
		onReload?: () => void;
		copy?: () => void;
		remove?: () => void;
		edit?: (content: string) => void;
		bookmark?: () => void;
		isBookmarked?: boolean;
		//채팅 목록 마지막 버블인지. 삭제 메뉴 노출 조건으로 사용
		isLast?: boolean;
	}>();

	let cleanHtml = $derived(DOMPurify.sanitize(marked.parse(text) as string));
	let isStreaming = $derived(cleanHtml.length > 1);
	let menuOpen = $state(false);

	// 토큰 단위 스트림 효과: 새로 들어온 청크는 plain text로 꼬리를 달고 애니메이션 →
	// 끝나면 markdown으로 정결되어 다시 파싱됨. (none이면 꼬리 없이 기존 동작) (2026-10-29)
	const streamFx: StreamFx = readStreamFx();
	let settled = $state(0);
	let settleTimer: ReturnType<typeof setTimeout> | undefined;
	$effect(() => {
		const len = text.length;
		if (settleTimer) clearTimeout(settleTimer);
		// isResponding 아님(히스토리 배치 로드)이면 delta 없이 즉시 정제 마크다운 —
		// 진입 시 200ms 동안 raw 원문 플래시를 막는다
		if (!isResponding || streamFx === 'none' || len <= settled) {
			settled = len;
			return;
		}
		settleTimer = setTimeout(() => (settled = len), STREAM_FX_SETTLE_MS[streamFx]);
		return () => clearTimeout(settleTimer);
	});
	const stableHtml = $derived(
		!isResponding || streamFx === 'none' || settled >= text.length
			? cleanHtml
			: DOMPurify.sanitize(marked.parse(text.slice(0, settled)) as string)
	);
	const deltaText = $derived(!isResponding || streamFx === 'none' ? '' : text.slice(settled));

	//callback(리롤/복사/삭제/수정/책갈피) 없으면 노출 안 함
	const hasActions = $derived(onReload || copy || remove || edit || bookmark);

	let editing = $state(false);
	let editDraft = $state('');

	function startEdit() {
		editDraft = text;
		editing = true;
		menuOpen = false;
	}

	function saveEdit() {
		edit?.(editDraft);
		editing = false;
	}

	function cancelEdit() {
		editing = false;
	}

	let loadingTexts = [
		'AI 가 이야기를 진행하는중...',
		'세계관 보면서 일어날 일 계산 중...',
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

	function closeMenu() {
		menuOpen = false;
	}
</script>

<div class="message-row {sender}">
	<div class="message-bubble {sender}">
		{#if editing}
			<textarea class="edit-area" bind:value={editDraft} rows={6}></textarea>
			<div class="edit-actions">
				<button class="edit-btn" onclick={cancelEdit}>취소</button>
				<button class="edit-btn primary" onclick={saveEdit}>저장</button>
			</div>
		{:else if isStreaming}
			<div class="markdown-content streaming">
				{@html stableHtml}
				{#if deltaText}
					<span
						class="fx-delta"
						class:fx-fade={streamFx === 'fade'}
						class:fx-pop={streamFx === 'pop'}>{deltaText}</span
					>
				{/if}
			</div>
		{:else}
			<div class="markdown-content">{@html cleanHtml}</div>
		{/if}
		{#if sender === 'assistant' && isResponding && !isStreaming}
			<div class="loading-indicator">
				<div class="loading-spinner"></div>
				<span class="loading-text">{loadingTexts[currentTextIndex]}</span>
			</div>
		{/if}

		{#if hasActions}
			<!-- 액션 행은 스트림 중에도 공간을 예약해 둠 — 종료 시 새로 등장하는 "새로고침" 플래시를 막는다 (2026-11-01) -->
			<div class="action-row" class:reserved={isResponding}>
			{#if live_token && live_token > 0}
				<span class="token-info">
					<span class="token-dot"></span>
					{live_token} tokens
				</span>
			{/if}
			<div class="bubble-actions">
				{#if onReload}
					<button class="action-btn" onclick={onReload} title="리롤" aria-label="리롤">
						<Icon name="reload" size={16} />
					</button>
				{/if}
				{#if copy || (remove && isLast) || edit || bookmark}
					<button
						class="action-btn"
						class:bookmarked={isBookmarked}
						onclick={() => (menuOpen = !menuOpen)}
						title="메뉴"
						aria-label="메뉴"
					>
						<Icon name="more" size={16} />
					</button>
				{/if}
				</div>
			</div>
			{/if}

		{#if menuOpen}
			<!--리롤 제외: 직접 버튼으로만 노출. 삭제는 마지막 버블(isLast)에만. models버튼처럼 하단 시트-->
			<Sheet padded={false} onClose={closeMenu}>
				<div class="menu-list">
					{#if copy}
						<button
							class="menu-item"
							role="menuitem"
							onclick={() => {
								copy();
								closeMenu();
							}}
						>
							<span class="menu-icon"><Icon name="copy" size={16} /></span>
							<span>복사</span>
						</button>
					{/if}
					{#if edit}
						<button class="menu-item" role="menuitem" onclick={startEdit}>
							<span class="menu-icon"><Icon name="edit" size={16} /></span>
							<span>수정</span>
						</button>
					{/if}
					{#if bookmark}
						<button
							class="menu-item"
							role="menuitemcheckbox"
							aria-checked={isBookmarked}
							onclick={() => {
								bookmark();
								closeMenu();
							}}
						>
							<span class="menu-icon"><Icon name="bookmark" size={16} /></span>
							<span>{isBookmarked ? '책갈피 해제' : '책갈피'}</span>
						</button>
					{/if}
					{#if remove && isLast}
						<button
							class="menu-item danger"
							role="menuitem"
							onclick={(e) => {
								e.stopPropagation(); //선택 모드 진입 후 같은 클릭이 row 토글로 번지지 않게
								remove();
								closeMenu();
							}}
						>
							<span class="menu-icon"><Icon name="trash" size={16} /></span>
							<span>삭제</span>
						</button>
					{/if}
				</div>
			</Sheet>
		{/if}
	</div>
</div>

<style>
	/* 토큰 단위 신규 청크 — 애니메이션 후 markdown으로 정결 (stream-fx.ts) */
	.fx-delta.fx-pop {
		display: inline-block;
	}

	.fx-delta.fx-fade {
		animation: fx-token-fade 200ms ease-out both;
	}

	.fx-delta.fx-pop {
		animation: fx-token-pop 380ms ease-in-out both;
	}

	@keyframes fx-token-fade {
		from {
			opacity: 0;
		}
	}

	/* 파도: 밀물(crest) → 물러남 → 잔물결 정지 */
	@keyframes fx-token-pop {
		0% {
			opacity: 0;
			transform: translateY(6px) scale(0.9);
		}
		55% {
			opacity: 1;
			transform: translateY(-2px) scale(1.04);
		}
		80% {
			transform: translateY(1px) scale(0.99);
		}
		100% {
			opacity: 1;
			transform: none;
		}
	}

	.message-row {
		position: relative;
	}

	.message-bubble {
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.action-row {
		display: contents; /* 래퍼는 레이아웃에 안 존재 — 자식(token-info·bubble-actions)은 기존 위치 그대로 */
	}

	.action-row.reserved {
		visibility: hidden; /* 스트림 중 공간 예약: 종료 시 액션 행이 새로 등장하는 "새로고침" 플래시 방지 (2026-11-01) */
	}

	.bubble-actions {
		display: flex;
		align-items: center;
		gap: 2px;
		margin-top: auto;
		margin-left: -5px; /*26px 박스를 아이콘 중심에 맞추면 아이콘이 텍스트 좌측선에서 5px 밀린다: 박스를 5px 당겨 두 개를 동시에 성립시킨다*/
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center; /*26px 탭 타겟 중심과 아이콘 중심 일치 — hover 배경에 아이콘이 치우쳐 보이지 않게*/
		width: 26px;
		height: 26px;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-tertiary);
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	@media (hover: hover) {
		.action-btn:hover {
			background: var(--color-bg-elevated);
			color: var(--color-text-primary);
		}
	}

	/* model-menu(ModelListMenu)와 같은 시트 언어: Sheet 공용 컴포넌트 사용 */
	.menu-list {
		padding: var(--space-2xs) var(--space-2xs) var(--space-2xs);
		display: flex;
		flex-direction: column;
		max-height: 60dvh;
		overflow-y: auto;
	}

	/*높이: model-item과 동일(터치 타겟 확보)*/
	.menu-item {
		display: flex;
		align-items: center;
		width: 100%;
		min-height: 3.5rem;
		padding: var(--space-sm) var(--space-md);
		border: none;
		background: transparent;
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		text-align: left;
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast);
		gap: var(--space-sm);
	}

	/* ContextMenu의 .menu-icon과 동일 규격 (20px slot, 16px 글리프) */
	.menu-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		flex-shrink: 0;
	}

	@media (hover: hover) {
		.menu-item:hover {
			background: var(--color-bg-elevated);
		}
	}

	.menu-item.danger {
		color: var(--color-error);
	}

	/* ---------- 인라인 편집 ---------- */
	.edit-area {
		width: 100%;
		box-sizing: border-box;
		padding: var(--space-sm);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		line-height: 1.6;
		resize: vertical;
	}

	.edit-area:focus {
		border-color: var(--color-accent-primary);
	}

	.edit-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-sm);
		margin-top: var(--space-2xs);
	}

	.edit-btn {
		min-height: 2.25rem;
		padding: 0 var(--space-md);
		background: transparent;
		border: 1px solid var(--color-border-strong);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		cursor: pointer;
	}

	.edit-btn.primary {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	/* 책갈피된 버블의 메뉴 트리거만 표시 */
	.action-btn.bookmarked {
		color: var(--color-text-primary);
	}

	@media (hover: hover) {
		.menu-item.danger:hover {
			background: color-mix(in srgb, var(--color-error) 10%, transparent);
		}
	}
</style>
