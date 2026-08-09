<script lang="ts">
	import { book } from '../../stores/promptBook.svelte.js';
	import InkTextArea from '../common/TextArea.svelte';

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
	<div class="section-header">
		<div class="section-icon">💬</div>
		<div class="section-text">
			<h2 class="section-title">시스템 프롬프트</h2>
			<p class="section-desc">AI 의 행동과 성격을 정의하는 핵심 프롬프트입니다</p>
		</div>
		<button class="expand-btn" onclick={toggleExpanded} aria-label={expanded ? '축소' : '확대'} title={expanded ? '축소' : '전체화면으로 편집'}>
			{expanded ? '⤡' : '⛶'}
		</button>
	</div>
	<div class="form-group form-group-expanded">
		<InkTextArea
			label="프롬프트"
			bind:value={book.systemPrompt}
			placeholder="시스템 프롬프트를 입력하세요..."
			rows={12}
			resize="vertical"
		/>
	</div>
</section>

<style>
	.form-section {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		transition: all var(--transition-base);
		position: relative;
		overflow: hidden;
		flex-shrink: 0;
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
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-xl);
	}

	.expand-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 299;
	}

	.form-section.expanded .form-group-expanded {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.form-section.expanded .form-group-expanded :global(.ink-textarea-wrapper) {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.form-section.expanded .form-group-expanded :global(textarea) {
		flex: 1;
		height: auto;
		min-height: 0;
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

	.section-header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--color-border-subtle);
	}

	.section-icon {
		font-size: 1.75rem;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-accent-glow);
		border-radius: var(--radius-md);
		flex-shrink: 0;
	}

	.section-text {
		flex: 1;
		min-width: 0;
	}

	.section-title {
		font-size: var(--font-size-xl);
		font-weight: 700;
		background: var(--color-accent-gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
		line-height: 1.2;
	}

	.section-desc {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: var(--space-xs) 0 0 0;
		line-height: 1.4;
	}

	.form-group {
		margin-bottom: 0;
	}

	.form-group-expanded {
		width: 100%;
	}

	.form-group-expanded :global(textarea) {
		min-height: 280px;
		font-family: 'Courier New', monospace;
		font-size: var(--font-size-sm);
		line-height: 1.6;
		resize: vertical;
		transition: all var(--transition-fast);
	}

	.form-group-expanded :global(textarea):focus {
		box-shadow: var(--shadow-glow-md);
	}

	@media (max-width: 768px) {
		.form-section {
			padding: var(--space-md);
		}

		.section-header {
			gap: var(--space-sm);
		}

		.section-icon {
			width: 40px;
			height: 40px;
			font-size: 1.25rem;
		}

		.section-title {
			font-size: var(--font-size-lg);
		}

		.section-desc {
			font-size: var(--font-size-xs);
		}

		.form-group-expanded :global(textarea) {
			min-height: 200px;
		}
	}
</style>