<script lang="ts">
	import axios from 'axios';
	import { PUBLIC_API_URL } from '$env/static/public';
	import MinMaxPercent from '$components/MinMaxPercent.svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import Btn from '$components/Common/Btn.svelte';
	import BtnCase from '$components/Common/BtnCase.svelte';
	import Desc from '$components/Common/Desc.svelte';
	import InputField from '$components/Common/InputField.svelte';
	import { toast } from '$lib/stores/toast.svelte';

	let system_prompt = $state('');
	let system_prompt_size = $state(0);
	let is_loading = $state(true);
	let is_saving = $state(false);
	let save_status = $state<'idle' | 'success' | 'error'>('idle');
	let placeholder = $derived(is_loading ? '로딩 중...' : '세계 규칙을 입력하세요...');

	async function load_system_prompt() {
		try {
			let request_system_prompt = await axios.get(`${PUBLIC_API_URL}/world_memory`, {});
			system_prompt = request_system_prompt.data;
		} catch {
			system_prompt = '';
		} finally {
			is_loading = false;
		}
	}

	async function handleSave() {
		is_saving = true;
		save_status = 'idle';
		try {
			let response = await axios.post(`${PUBLIC_API_URL}/world_memory`, {
				prompt: system_prompt
			});
			if (response.status === 200) {
				save_status = 'success';
				toast.success('저장 완료!');
			} else {
				save_status = 'error';
				toast.error('저장 실패');
			}
		} catch {
			save_status = 'error';
			toast.error('저장 실패');
		} finally {
			is_saving = false;
		}
	}

	load_system_prompt();
</script>

<div class="world-edit">
	<Desc>세계의 규칙을 변경합니다.</Desc>

	<div class="textarea-wrapper">
		<InputField
			type="textarea"
			bind:value={system_prompt}
			{placeholder}
			disabled={is_loading}
			rows={12}
		/>
	</div>

	<div class="stats-bar">
		<div class="stats-text">
			<span class="char-count">{system_prompt.length}자</span>
			<span class="stat-separator">/</span>
			<span class="size-count">컨텍스트: {system_prompt_size}</span>
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
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-md);
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

	@media (max-width: 640px) {
		.world-edit {
			padding: var(--space-sm);
			gap: var(--space-sm);
		}
	}
</style>
