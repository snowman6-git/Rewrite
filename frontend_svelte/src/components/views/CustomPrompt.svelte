<script lang="ts">
	import { onMount } from 'svelte';
	import { apiBase } from '$api/client';
	import { toast } from '$lib/stores/toast.svelte';
	import Btn from '$components/Common/Btn.svelte';
	import BtnCase from '$components/Common/BtnCase.svelte';
	import Desc from '$components/Common/Desc.svelte';
	import InputField from '$components/Common/InputField.svelte';
	import { tuningState, PROMPT_MAX } from '$lib/states/tuning.svelte';

	let is_saving = $state(false);

	async function load_custom_prompt() {
		try {
			const response = await fetch(`${apiBase()}/custom_prompt`);
			if (response.ok) tuningState.customPrompt = await response.text();
		} catch {
			// API 미구현 전까지 실패해도 유지
		}
	}

	async function handleSave() {
		is_saving = true;
		try {
			const response = await fetch(`${apiBase()}/custom_prompt`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: tuningState.customPrompt })
			});
			if (response.ok) {
				toast.success('저장 완료!');
			} else {
				toast.error('저장 실패');
			}
		} catch {
			toast.error('저장 실패');
		} finally {
			is_saving = false;
		}
	}

	onMount(load_custom_prompt);
</script>

<div class="custom-prompt view-container">
	<Desc>이 책에만 주입되는 추가 지시어.</Desc>

	<div class="textarea-wrapper">
		<InputField
			type="textarea"
			rows={12}
			placeholder="추가 지시를 입력하세요..."
			bind:value={tuningState.customPrompt}
		/>
	</div>

	<div class="stats-bar">
		<span class="char-count">{tuningState.customPrompt.length}/{PROMPT_MAX}자</span>
	</div>

	<BtnCase>
		<Btn variant="cancel" onclick={load_custom_prompt}>리로드</Btn>
		<Btn variant="save" onclick={handleSave} disabled={is_saving}>
			{is_saving ? '저장중...' : '저장'}
		</Btn>
	</BtnCase>
</div>

<style>
	.custom-prompt {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.textarea-wrapper {
		flex: 1;
		min-height: 0;
		overflow: hidden;
		margin-top: var(--space-sm);
	}

	.textarea-wrapper :global(textarea) {
		height: 100%;
		min-height: 0;
		resize: none;
	}

	.stats-bar {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: var(--space-xs) var(--space-sm);
	}

	.char-count {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		font-variant-numeric: tabular-nums;
	}
</style>
