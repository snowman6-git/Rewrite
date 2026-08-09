<script lang="ts">
	import EditorHeader from './editor/Header.svelte';
	import FormBookInfo from './editor/FormBookInfo.svelte';
	import FormStartingPoints from './editor/FormStartingPoints.svelte';
	import FormSystemPrompt from './editor/FormSystemPrompt.svelte';
</script>

<div class="editor-container">
	<EditorHeader />

	<div class="editor-body">
		<FormBookInfo />

		<div class="split-row">
			<FormStartingPoints />
			<FormSystemPrompt />
		</div>
	</div>
</div>

<style>
	.editor-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--color-bg-primary);
	}

	.editor-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		padding: var(--space-lg);
		flex: 1;
		overflow: auto;
		max-width: 1100px;
		width: 100%;
		margin: 0 auto;
	}

	.split-row {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
		flex-shrink: 0;
	}

	/* Tablet */
	@media (max-width: 1023px) {
		.editor-body {
			max-width: none;
		}
	}

	/* Mobile / 세로(portrait) */
	@media (max-width: 767px) {
		.editor-body {
			padding: var(--space-md);
			gap: var(--space-md);
		}

		.split-row {
			gap: var(--space-md);
		}
	}

	/* 가로(landscape) 와이드 화면: 시작시점 / 시스템 프롬프트를 2열로 */
	@media (min-width: 1100px) and (orientation: landscape) {
		.split-row {
			grid-template-columns: 1fr 1fr;
			align-items: start;
		}
	}
</style>
