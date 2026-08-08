<script lang="ts">
	import type { PromptBookState } from '../../types/prompt-book.js';
	import InkTextArea from '../common/TextArea.svelte';

	let { state } = $props<{ state: PromptBookState }>();
</script>

<section class="form-section">
	<h2 class="section-title">💬 시스템 프롬프트</h2>
	<div class="form-group">
		<InkTextArea
			label="프롬프트"
			bind:value={state.systemPrompt}
			placeholder="시스템 프롬프트를 입력하세요"
			rows={10}
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
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-accent-primary);
		margin-bottom: var(--space-md);
	}

	.form-group {
		margin-bottom: 0;
	}
</style>