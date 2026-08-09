<script lang="ts">
	import type { PromptBookState } from '../../types/prompt-book.js';
	import { stateToToml } from '../../utils/toml.js';

	let { state: modelState } = $props<{ state: PromptBookState }>();

	let tomlPreview = $derived(stateToToml(modelState));
	let copied: boolean = $state(false);

	function copyToClipboard() {
		navigator.clipboard.writeText(tomlPreview).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}
</script>

<div class="preview-panel">
	<div class="panel-header">
		<div class="header-left">
			<div class="section-icon">📄</div>
			<div class="header-text">
				<h2 class="section-title">TOML 미리보기</h2>
				<span class="panel-subtitle">실시간 생성되는 설정 파일</span>
			</div>
		</div>
		<button class="copy-btn" onclick={copyToClipboard} title="복사">
			{#if copied}
				<span class="copy-icon">✓</span>
				<span class="copy-text">복사됨!</span>
			{:else}
				<span class="copy-icon">📋</span>
				<span class="copy-text">복사</span>
			{/if}
		</button>
	</div>
	<div class="toml-container">
		<pre class="toml-preview">{tomlPreview}</pre>
	</div>
</div>

<style>
	.preview-panel {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		overflow: auto;
		height: 100%;
		display: flex;
		flex-direction: column;
		transition: all var(--transition-base);
		position: relative;
		flex: 1;
		min-width: 0;
		width: 100%;
	}

	.preview-panel::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 4px;
		height: 100%;
		background: var(--color-accent-gradient);
		opacity: 0;
		transition: opacity var(--transition-fast);
	}

	.preview-panel:hover {
		border-color: var(--color-accent-primary);
		box-shadow: var(--shadow-glow);
	}

	.preview-panel:hover::before {
		opacity: 1;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-lg);
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--color-border-subtle);
		gap: var(--space-md);
		flex-shrink: 0;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		flex: 1;
		min-width: 0;
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

	.header-text {
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

	.panel-subtitle {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		margin-top: var(--space-xs);
		display: block;
	}

	.copy-btn {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.copy-btn:hover {
		background: var(--color-bg-hover);
		border-color: var(--color-accent-primary);
		color: var(--color-accent-primary);
		box-shadow: var(--shadow-glow);
	}

	.copy-btn:active {
		transform: scale(0.98);
	}

	.copy-icon {
		font-size: 1rem;
	}

	.copy-text {
		transition: all var(--transition-fast);
	}

	.toml-container {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	.toml-preview {
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-lg);
		font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		overflow: auto;
		white-space: pre-wrap;
		word-break: break-word;
		flex: 1;
		margin: 0;
		line-height: 1.6;
		tab-size: 2;
		position: relative;
	}

	.toml-preview::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(90deg, transparent, var(--color-accent-primary), transparent);
		opacity: 0.5;
	}

	/* Landscape: 넓은 화면에서는 글자 크기만 살짝 키움 (패널 자체는 부모 폭을 그대로 채움) */
	@media (min-width: 1280px) and (orientation: landscape),
	       (min-width: 1280px) and (min-height: 600px) {
		.toml-preview {
			font-size: var(--font-size-base);
			padding: var(--space-xl);
		}
	}

	/* Large screen (1920px+) */
	@media (min-width: 1920px) and (orientation: landscape),
	       (min-width: 1920px) and (min-height: 800px) {
		.preview-panel {
			padding: var(--space-2xl);
		}

		.section-title {
			font-size: var(--font-size-2xl);
		}

		.toml-preview {
			font-size: var(--font-size-lg);
			padding: var(--space-2xl);
		}
	}

	@media (max-width: 768px) {
		.preview-panel {
			padding: var(--space-md);
		}

		.panel-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}

		.header-left {
			width: 100%;
		}

		.copy-btn {
			width: 100%;
			justify-content: center;
		}

		.section-title {
			font-size: var(--font-size-lg);
		}

		.toml-preview {
			padding: var(--space-md);
			font-size: var(--font-size-xs);
		}
	}
</style>