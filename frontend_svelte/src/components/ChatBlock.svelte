<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
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

	//callback(재생성/복사/삭제/수정/책갈피) 없으면 노출 안 함
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
			<div class="markdown-content streaming">{@html cleanHtml}</div>
		{:else}
			<div class="markdown-content">{@html cleanHtml}</div>
		{/if}
		{#if sender === 'assistant' && isResponding && !isStreaming}
			<div class="loading-indicator">
				<div class="loading-spinner"></div>
				<span class="loading-text">{loadingTexts[currentTextIndex]}</span>
			</div>
		{/if}

		{#if hasActions && !isResponding}
			{#if live_token && live_token > 0}
				<span class="token-info">
					<span class="token-dot"></span>
					{live_token} tokens
				</span>
			{/if}
			<div class="bubble-actions">
				{#if onReload}
					<button class="action-btn" onclick={onReload} title="재생성" aria-label="재생성">
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
		{/if}

		{#if menuOpen}
			<!--재생성 제외: 직접 버튼으로만 노출. 삭제는 마지막 버블(isLast)에만. models버튼처럼 하단 시트-->
			<div class="menu-overlay" role="presentation" onclick={closeMenu}></div>
			<div
				class="menu-sheet"
				role="group"
				aria-label="메시지 작업"
				in:fly={{ y: 100, duration: 250, easing: cubicOut }}
				out:fly={{ y: 100, duration: 250, easing: cubicOut }}
			>
				<div class="menu-list">
					{#if copy}
						<button
							class="menu-item"
							role="menuitem"
							onclick={() => {
								copy();
								closeMenu();
							}}>복사</button
						>
					{/if}
					{#if edit}
						<button class="menu-item" role="menuitem" onclick={startEdit}>수정</button>
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
							{isBookmarked ? '책갈피 해제' : '책갈피'}
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
							}}>삭제</button
						>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.message-row {
		position: relative;
	}

	.message-bubble {
		border-radius: var(--radius-md);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.bubble-actions {
		display: flex;
		align-items: center;
		gap: 2px;
		margin-top: auto;
	}

	.action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: flex-start; /*아이콘이 채팅 텍스트와 좌측 정렬, 탭 타겟(26px)은 유지*/
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

	.menu-overlay {
		position: fixed;
		inset: 0;
		background: var(--color-scrim);
		z-index: 998;
	}

	/* model-menu(ModelListMenu)와 같은 시트 언어: 조용한 테두리, 플랫 */
	.menu-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 999;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-strong);
		border-bottom: none;
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
	}

	.menu-sheet .menu-list {
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
