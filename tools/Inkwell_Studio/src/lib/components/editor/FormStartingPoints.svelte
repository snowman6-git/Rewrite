<script lang="ts">
	import type { StartingPoint } from '../../types/prompt-book.js';
	import { book, addStartingPoint, removeStartingPoint, updateStartingPoint } from '../../stores/promptBook.svelte.js';
	import InkInput from '../common/Input.svelte';
	import InkTextArea from '../common/TextArea.svelte';
	import InkButton from '../common/Button.svelte';

	let expanded = $state(false);
	function toggleExpanded() {
		expanded = !expanded;
	}
</script>

<svelte:window onkeydown={(e) => expanded && e.key === 'Escape' && (expanded = false)} />

{#if expanded}
	<div class="expand-backdrop" onclick={toggleExpanded} role="presentation"></div>
{/if}

<section class="form-section" class:expanded>
	<div class="section-header-row">
		<h2 class="section-title">🚀 시작시점</h2>
		<button class="expand-btn" onclick={toggleExpanded} aria-label={expanded ? '축소' : '확대'} title={expanded ? '축소' : '전체화면으로 편집'}>
			{expanded ? '⤡' : '⛶'}
		</button>
	</div>
	<div class="starting-points">
		{#each book.startingPoints as sp, i (sp.id)}
			<div class="starting-point-card">
				<div class="card-header">
					<span>시작시점 #{i + 1}</span>
					{#if book.startingPoints.length > 1}
						<button
							class="btn-icon"
							onclick={() => removeStartingPoint(i)}
							aria-label="삭제"
						>
							✕
						</button>
					{/if}
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
	<InkButton variant="secondary" onclick={addStartingPoint}>
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
		flex-shrink: 0;
		transition: all var(--transition-base);
		position: relative;
		overflow: hidden;
	}

	.form-section::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background: var(--color-accent-gradient);
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.form-section:hover {
		border-color: var(--color-accent-primary);
		box-shadow: var(--shadow-glow);
	}

	.form-section:hover::before {
		opacity: 1;
	}

	/* 요소별 전체화면 확대 */
	.form-section.expanded {
		position: fixed;
		inset: var(--space-lg);
		z-index: 300;
		overflow: hidden;
		box-shadow: var(--shadow-xl);
	}

	.form-section.expanded .starting-points {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
	}

	.expand-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 299;
	}

	.section-header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-accent-primary);
		margin: 0;
	}

	.expand-btn {
		flex-shrink: 0;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		cursor: pointer;
		font-size: var(--font-size-base);
		transition: all var(--transition-fast);
	}

	.expand-btn:hover {
		border-color: var(--color-accent-primary);
		color: var(--color-accent-primary);
		background: var(--color-bg-hover);
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
		transition: border-color var(--transition-fast);
	}

	.starting-point-card:hover {
		border-color: var(--color-accent-primary);
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
