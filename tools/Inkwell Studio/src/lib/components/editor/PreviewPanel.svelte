<script lang="ts">
	import type { PromptBookState } from '../../types/prompt-book.js';
	import { stateToToml } from '../../utils/toml.js';

	let { state } = $props<{ state: PromptBookState }>();

	let tomlPreview = $derived(stateToToml(state));
</script>

<div class="preview-panel">
	<h2 class="section-title">📄 TOML 미리보기</h2>
	<pre class="toml-preview">{tomlPreview}</pre>
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
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-accent-primary);
		margin-bottom: var(--space-md);
	}

	.toml-preview {
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		font-family: 'Courier New', monospace;
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		overflow-x: auto;
		white-space: pre-wrap;
		word-break: break-word;
		flex: 1;
		margin: 0;
	}
</style>