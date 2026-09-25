<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import BubbleEdit from './BubbleEdit.svelte';

	let {
		text,
		live_token,
		sender = 'assistant',
		isResponding = false,
		onReload,
		copy,
		remove,
		edit,
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
		//채팅 목록 마지막 버블인지. 삭제 메뉴 노출 조건으로 사용
		isLast?: boolean;
	}>();

	let cleanHtml = $derived(DOMPurify.sanitize(text));
	let isStreaming = $derived(cleanHtml.length > 1);
	let isRespondingProp = $derived(isResponding);
	let menuOpen = $state(false);

	//callback(재생성/수정/복사/삭제) 없으면 노출 안 함
	//수정 모드
	let isEditing = $state(false);
	let editDraft = $state('');

	function startEdit() {
		editDraft = text;
		isEditing = true;
	}
	async function saveEdit() {
		const content = editDraft;
		isEditing = false;
		await edit?.(content);
	}
	function cancelEdit() {
		isEditing = false;
	}

	//재생성/수정/복사/삭제 callback 중 하나 있으면 노출
	const hasActions = $derived(onReload || edit || copy || remove);

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
		{#if isEditing}
			<BubbleEdit bind:value={editDraft} onSave={saveEdit} onCancel={cancelEdit} />
		{:else}
			{#if isStreaming}
				<div class="markdown-content streaming">{@html marked.parse(cleanHtml)}</div>
			{:else}
				<div class="markdown-content">{@html marked.parse(cleanHtml)}</div>
			{/if}
			{#if sender === 'assistant' && isRespondingProp && !isStreaming}
				<div class="loading-indicator">
					<div class="loading-spinner"></div>
					<span class="loading-text">{loadingTexts[currentTextIndex]}</span>
				</div>
			{/if}
		{/if}

		{#if hasActions && !isRespondingProp && !isEditing}
			{#if live_token && live_token > 0}
				<span class="token-info">
					<span class="token-dot"></span>
					{live_token} tokens
				</span>
			{/if}
			<div class="bubble-actions">
				{#if onReload}
					<button class="action-btn" onclick={onReload} title="재생성" aria-label="재생성">
						<svg
							viewBox="0 0 24 24"
							width="16"
							height="16"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							><path d="M21 12a9 9 0 1 1-3.1-6.8" /><polyline points="21 3 21 9 15 9" /></svg
						>
					</button>
				{/if}
				{#if copy || (remove && isLast)}
					<button
						class="action-btn"
						onclick={() => (menuOpen = !menuOpen)}
						title="메뉴"
						aria-label="메뉴"
					>
						<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"
							><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle
								cx="19"
								cy="12"
								r="1.6"
							/></svg
						>
					</button>
				{/if}
			</div>
		{/if}

		{#if menuOpen}
			<!--재생성 제외: 직접 버튼으로만 노출. 삭제는 마지막 버블(isLast)에만. models버튼처럼 하단 시트-->
			<div class="menu-overlay" role="presentation" onclick={closeMenu}></div>
			<div
				class="menu-sheet"
				role="menu"
				in:fly={{ y: 100, duration: 250, easing: cubicOut }}
				out:fly={{ y: 100, duration: 250, easing: cubicOut }}
			>
				<div class="menu-list">
					{#if copy}
						<button
							class="menu-item"
							onclick={() => {
								copy();
								closeMenu();
							}}>복사</button
						>
					{/if}
					{#if edit}
						<button
							class="menu-item"
							onclick={() => {
								startEdit();
								closeMenu();
							}}>수정</button
						>
					{/if}
					{#if remove && isLast}
						<button
							class="menu-item danger"
							onclick={() => {
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

	.action-btn:hover {
		background: var(--color-bg-elevated);
		color: var(--color-text-primary);
	}

	.menu-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 998;
		backdrop-filter: blur(2px);
	}

	.menu-sheet {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 999;
	}

	.menu-sheet .menu-list {
		padding: var(--space-xs); /*0.5rem→0.25rem, 간격 절반*/
		display: flex;
		flex-direction: column;
		border: 0.15rem solid var(--color-accent-primary);
		border-radius: 1rem 1rem 0 0;
		border-bottom: none;
		overflow: hidden;
		background: var(--color-bg-tertiary);
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

	.menu-item:hover {
		background: var(--color-bg-elevated);
	}

	.menu-item.danger {
		color: var(--color-error);
	}

	.menu-item.danger:hover {
		background: color-mix(in srgb, var(--color-error) 10%, transparent);
	}

</style>
