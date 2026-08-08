<script lang="ts">
	import type { PromptBookState } from '../../types/prompt-book.js';
	import InkInput from '../common/Input.svelte';
	import InkTextArea from '../common/TextArea.svelte';

	let { state } = $props<{ state: PromptBookState }>();
</script>

<section class="form-section">
	<h2 class="section-title">📖 책 정보</h2>
	<div class="form-group">
		<InkInput
			label="책 ID"
			bind:value={state.bookId}
			placeholder="책 ID 를 입력하세요"
		/>
	</div>
</section>

<section class="form-section">
	<h2 class="section-title">🎨 표지 정보</h2>
	<div class="form-group">
		<InkInput
			label="제목"
			bind:value={state.coverTitle}
			placeholder="책 제목을 입력하세요"
		/>
	</div>
	<div class="form-group">
		<InkTextArea
			label="설명"
			bind:value={state.coverDesc}
			placeholder="책 설명을 입력하세요"
			rows={3}
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
		margin-bottom: var(--space-md);
	}

	.form-group:last-child {
		margin-bottom: 0;
	}
</style>