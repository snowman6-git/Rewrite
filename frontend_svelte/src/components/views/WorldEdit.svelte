<script lang="ts">
	import { tick } from 'svelte';
	import { Marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { apiBase } from '$api/client';
	import { chatState } from '$lib/states/chat.svelte';
	import MinMaxPercent from '$components/MinMaxPercent.svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import Btn from '$components/Common/Btn.svelte';
	import BtnCase from '$components/Common/BtnCase.svelte';
	import Desc from '$components/Common/Desc.svelte';
	import InputField from '$components/Common/InputField.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import '$lib/assets/chat_body.css';

	// 미리보기 전용 marked 인스턴스: 단일 \n → <br> (규칙 목록의 줄바꿈이 의미이므로).
	// 전역 marked 설정은 건드리지 않음 (ChatBlock 등 다른 사용자 영향 방지).
	const md = new Marked({ breaks: true, gfm: true });

	let system_prompt = $state('');
	let system_prompt_size = $state(0);
	let is_loading = $state(true);
	let is_saving = $state(false);
	let preview = $state(false);
	let placeholder = $derived(is_loading ? '로딩 중...' : '세계 규칙을 입력하세요...');
	let previewHtml = $derived(DOMPurify.sanitize(md.parse(system_prompt) as string));

	async function load_system_prompt() {
		try {
			const response = await fetch(`${apiBase()}/world_edit?book_id=${chatState.book_id}`);
			// 500일 때 본문은 "Internal Server Error" 텍스트 — ok 가드 없으면 그게 프롬프트로 대입됨
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			system_prompt = await response.text();
		} catch {
			system_prompt = '';
			toast.error('세계 규칙을 불러오지 못했습니다.');
		} finally {
			is_loading = false;
		}
	}

	async function handleSave() {
		is_saving = true;
		try {
			const response = await fetch(`${apiBase()}/world_edit`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ book_id: chatState.book_id, prompt: system_prompt })
			});
			//백엔드 계약: 200 {status:"ok"} / 404 {status:"ok"} — 바디 동일, status로만 판별
			if (!response.ok) {
				toast.error(
					response.status === 404
						? '세션을 찾지 못했습니다. (404)'
						: `저장에 실패했습니다. (HTTP ${response.status})`
				);
				return;
			}
			toast.success('저장 완료!');
		} catch {
			//네트워크 레벨 실패: 서버 미기동 / CORS — HTTP 응답 자체가 없는 경우
			toast.error('서버에 연결하지 못했습니다.');
		} finally {
			is_saving = false;
		}
	}

	$effect(() => {
		load_system_prompt();
	});

	// Tab = 2스페이스 들여쓰기. 커서에 삽입 후 tick에서 커서 복원.
	function onTextareaKeydown(e: KeyboardEvent) {
		if (e.key !== 'Tab') return;
		e.preventDefault();
		const ta = e.currentTarget as HTMLTextAreaElement;
		const s = ta.selectionStart;
		const en = ta.selectionEnd;
		system_prompt = system_prompt.slice(0, s) + '  ' + system_prompt.slice(en);
		tick().then(() => {
			ta.focus();
			ta.setSelectionRange(s + 2, s + 2);
		});
	}
</script>

<div class="world-edit view-container">
	<Desc>세계의 규칙을 변경합니다.</Desc>

	<div class="editor-tabs" role="tablist" aria-label="에디터 모드">
		<button
			role="tab"
			aria-selected={!preview}
			class:active={!preview}
			onclick={() => (preview = false)}>편집</button
		>
		<button
			role="tab"
			aria-selected={preview}
			class:active={preview}
			onclick={() => (preview = true)}>미리보기</button
		>
	</div>

	<div class="textarea-wrapper">
		{#if preview}
			<div class="markdown-content preview-scroll">
				{#if system_prompt.trim() === ''}
					<span class="preview-empty">미리볼 내용이 없습니다.</span>
				{:else}
					{@html previewHtml}
				{/if}
			</div>
		{:else}
			<InputField
				type="textarea"
				bind:value={system_prompt}
				{placeholder}
				disabled={is_loading}
				rows={12}
				onkeydown={onTextareaKeydown}
			/>
		{/if}
	</div>

	<div class="stats-bar">
		<div class="stats-text">
			<span class="char-count">{system_prompt.length}자</span>
			<span class="stat-separator">/</span>
			<span class="size-count">토큰 크기: {system_prompt_size}</span>
		</div>
		<div class="stats-percent">
			<MinMaxPercent min={system_prompt_size} max={modelsState.context_size} />
		</div>
	</div>

	<BtnCase>
		<Btn variant="cancel" onclick={() => load_system_prompt()}>리로드</Btn>
		<Btn variant="save" onclick={handleSave} disabled={is_saving}>
			{is_saving ? '저장중...' : '저장'}
		</Btn>
	</BtnCase>
</div>

<style>
	.world-edit {
		height: 100%;
	}

	.textarea-wrapper {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	.textarea-wrapper :global(textarea) {
		height: 100%;
		min-height: 0;
		resize: none;
	}

	.editor-tabs {
		display: flex;
		gap: var(--space-xs);
		margin-bottom: var(--space-xs);
	}

	.editor-tabs button {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-tertiary);
		font-size: var(--font-size-xs);
		font-family: inherit;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.editor-tabs button.active {
		background: var(--color-accent-primary);
		border-color: var(--color-accent-primary);
		color: var(--color-text-inverse);
	}

	@media (hover: hover) {
		.editor-tabs button:not(.active):hover {
			color: var(--color-text-primary);
			border-color: var(--color-border-strong, var(--color-border));
		}
	}

	.preview-scroll {
		height: 100%;
		overflow-y: auto;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-tertiary);
	}

	.preview-empty {
		color: var(--color-text-tertiary);
		font-size: var(--font-size-sm);
	}

	.stats-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-xs) var(--space-sm);
	}

	.stats-text {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.stat-separator {
		color: var(--color-border);
		margin: 0 var(--space-xs);
	}

	.stats-percent {
		font-size: var(--font-size-xs);
	}
</style>
