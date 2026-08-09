<script lang="ts">
	import { book } from '../../stores/promptBook.svelte.js';
	import InkInput from '../common/Input.svelte';
	import InkTextArea from '../common/TextArea.svelte';

	let copied = $state(false);
	let expanded = $state(false);

	function copyId() {
		navigator.clipboard.writeText(book.bookId).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 1500);
		});
	}

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
		<div class="section-icon">📖</div>
		<div class="section-text">
			<h2 class="section-title">책 정보</h2>
			<p class="section-desc">독자에게 보여질 책의 기본 정보를 작성합니다</p>
		</div>
		<button class="expand-btn" onclick={toggleExpanded} aria-label={expanded ? '축소' : '확대'} title={expanded ? '축소' : '전체화면으로 편집'}>
			{expanded ? '⤡' : '⛶'}
		</button>
	</div>

	<button type="button" class="book-id" onclick={copyId} title="클릭하여 ID 복사">
		<span class="book-id-label">ID</span>
		<code class="book-id-value">{book.bookId}</code>
		<span class="book-id-hint">{copied ? '복사됨!' : '자동 생성됨'}</span>
	</button>

	<div class="form-group">
		<InkInput label="제목" bind:value={book.coverTitle} placeholder="책 제목을 입력하세요" required />
	</div>
	<div class="form-group form-group-expanded">
		<InkTextArea label="설명" bind:value={book.coverDesc} placeholder="책 설명을 입력하세요" rows={3} />
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
		/* overflow: hidden 때문에 flex 자동 min-height가 0이 되어 좁은 화면에서
		   형제 섹션에 밀려 찌그러질 수 있음 → 항상 내용 높이를 유지하도록 고정 */
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
		overflow: auto;
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

	.book-id {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		width: 100%;
		margin-bottom: var(--space-md);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-tertiary);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		text-align: left;
	}

	.book-id:hover {
		border-color: var(--color-accent-primary);
	}

	.book-id-label {
		font-size: var(--font-size-xs);
		font-weight: 700;
		color: var(--color-text-tertiary);
		flex-shrink: 0;
	}

	.book-id-value {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
	}

	.book-id-hint {
		font-size: var(--font-size-xs);
		color: var(--color-accent-primary);
		flex-shrink: 0;
	}

	.form-group {
		margin-bottom: var(--space-md);
	}

	.form-group:last-child {
		margin-bottom: 0;
	}

	.form-group-expanded {
		width: 100%;
	}

	.form-group-expanded :global(textarea) {
		min-height: 100px;
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

		.book-id-value {
			font-size: 0.65rem;
		}
	}

	/* 세로(portrait) 모바일: ID 배지를 줄바꿈 없이 더 압축 */
	@media (max-width: 480px) and (orientation: portrait) {
		.book-id {
			flex-wrap: wrap;
		}

		.book-id-value {
			order: 3;
			flex-basis: 100%;
		}
	}
</style>
