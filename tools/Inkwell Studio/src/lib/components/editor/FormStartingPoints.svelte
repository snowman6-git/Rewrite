<script lang="ts">
	import type { StartingPoint } from '../../types/prompt-book.js';
	import InkInput from '../common/Input.svelte';
	import InkTextArea from '../common/TextArea.svelte';
	import InkButton from '../common/Button.svelte';

	let {
		startingPoints,
		onAdd,
		onRemove,
		onUpdate
	} = $props<{
		startingPoints: StartingPoint[];
		onAdd?: () => void;
		onRemove?: (index: number) => void;
		onUpdate?: (index: number, field: keyof StartingPoint, value: string | number) => void;
	}>();
</script>

<section class="form-section">
	<h2 class="section-title">🚀 시작시점</h2>
	<div class="starting-points">
		{#each startingPoints as sp, i (sp.id)}
			<div class="starting-point-card">
				<div class="card-header">
					<span>시작시점 #{i + 1}</span>
					{#if startingPoints.length > 1}
						<button
							class="btn-icon"
							onclick={() => onRemove?.(i)}
							aria-label="삭제"
						>
							✕
						</button>
					{/if}
				</div>
				<div class="form-group">
					<InkInput
						label="ID"
						type="number"
						value={String(sp.id)}
						oninput={(e) =>
							onUpdate?.(i, 'id', parseInt((e.target as HTMLInputElement).value, 10))
						}
					/>
				</div>
				<div class="form-group">
					<InkInput
						label="제목"
						bind:value={sp.name}
						placeholder="시작 지점 제목"
					/>
				</div>
				<div class="form-group">
					<InkTextArea
						label="내용"
						bind:value={sp.content}
						placeholder="시작 지점 내용을 입력하세요"
						rows={6}
					/>
				</div>
			</div>
		{/each}
	</div>
	<InkButton variant="secondary" onclick={onAdd}>
		+ 시작 지점 추가
	</InkButton>
</section>

<style>
	.form-section {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-accent-primary);
		margin: 0;
	}

	.starting-points {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.starting-point-card {
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
	}

	.card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-sm);
	}

	.card-header span {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.btn-icon {
		background: transparent;
		border: none;
		color: var(--color-error);
		font-size: var(--font-size-lg);
		cursor: pointer;
		padding: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
		transition: background var(--transition-fast);
	}

	.btn-icon:hover {
		background: rgba(239, 68, 68, 0.1);
	}

	.form-group {
		margin-bottom: var(--space-sm);
	}

	.form-group:last-child {
		margin-bottom: 0;
	}
</style>