<script lang="ts">
	import axios from 'axios';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { chatState } from '$lib/states/chat.svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import MinMaxPercent from '$components/MinMaxPercent.svelte';
	import { memoryTools } from '$lib/states/memory.svelte';
	import Btn from '$components/Common/Btn.svelte';
	import BtnCase from '$components/Common/BtnCase.svelte';
	import Desc from '$components/Common/Desc.svelte';
	import { toast } from '$lib/stores/toast.svelte';

	let is_resetting = $state(false);
	let reset_status = $state<'idle' | 'success' | 'error'>('idle');

	async function reset_world_memory() {
		is_resetting = true;
		reset_status = 'idle';
		try {
			let request_reset = await axios.post(`${PUBLIC_API_URL}/reset_world_memory`, {});
			if (request_reset.status === 200) {
				reset_status = 'success';
				chatState.loadHistory();
				toast.success('메모리가 초기화되었습니다.');
			} else {
				reset_status = 'error';
				toast.error('초기화 실패');
			}
		} catch {
			reset_status = 'error';
			toast.error('초기화 실패');
		} finally {
			is_resetting = false;
		}
	}
</script>

<div class="memory-view">
	<Desc>기록된 메모리를 수정, 삭제합니다.</Desc>

	<div class="usage-card">
		<div class="usage-info">
			<span class="usage-label">메모리 사용량</span>
			<span class="usage-value">
				{memoryTools.safeMemoryUsage} / {modelsState.context_size}
			</span>
		</div>
		<div class="usage-bar">
			<MinMaxPercent
				class="usage-percent"
				min={memoryTools.safeMemoryUsage}
				max={memoryTools.safeContextSize}
			/>
			<progress
				class="usage-progress"
				value={memoryTools.safeMemoryUsage}
				max={memoryTools.safeContextSize}
			></progress>
		</div>
	</div>

	<BtnCase>
		<Btn variant="reset" disabled={is_resetting} onclick={reset_world_memory}>
			{is_resetting ? '리셋중...' : '메모리 초기화'}
		</Btn>
	</BtnCase>
</div>

<style>
	.memory-view {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		padding: var(--space-md);
	}

	.usage-card {
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-tertiary);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.usage-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.usage-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.usage-value {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		font-weight: 500;
		font-variant-numeric: tabular-nums;
	}

	.usage-bar {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.usage-progress {
		flex: 1;
		height: 6px;
		border-radius: var(--radius-full);
		overflow: hidden;
		background: var(--color-bg-elevated);
		border: none;
		appearance: none;
		-webkit-appearance: none;
	}

	.usage-progress::-webkit-progress-bar {
		background: var(--color-bg-elevated);
		border-radius: var(--radius-full);
	}

	.usage-progress::-webkit-progress-value {
		background: var(--color-accent-gradient);
		border-radius: var(--radius-full);
	}

	.usage-progress::-moz-progress-bar {
		background: var(--color-accent-gradient);
		border-radius: var(--radius-full);
	}

	@media (max-width: 640px) {
		.memory-view {
			padding: var(--space-sm);
			gap: var(--space-md);
		}

		.usage-card {
			padding: var(--space-sm);
		}
	}
</style>
