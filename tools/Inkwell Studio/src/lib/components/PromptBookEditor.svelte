<script lang="ts">
	import type { PromptBookState, StartingPoint } from '../types/prompt-book.js';
	import { downloadToml, loadTomlFromFile } from '../utils/toml.js';
	import { initialState } from '../types/prompt-book.js';
	import EditorHeader from './editor/Header.svelte';
	import FormBookInfo from './editor/FormBookInfo.svelte';
	import FormStartingPoints from './editor/FormStartingPoints.svelte';
	import FormSystemPrompt from './editor/FormSystemPrompt.svelte';
	import PreviewPanel from './editor/PreviewPanel.svelte';

	let { state: initialModelState, showPreview = false } = $props<{ state: PromptBookState; showPreview?: boolean }>();
	let state: PromptBookState = $state({ ...initialModelState });

	function addStartingPoint() {
		const nextId = state.startingPoints.length > 0 ? Math.max(...state.startingPoints.map((sp: StartingPoint) => sp.id)) + 1 : 1;
		state.startingPoints = [...state.startingPoints, { id: nextId, name: '', content: '' }];
	}

	function removeStartingPoint(index: number) {
		if (state.startingPoints.length === 1) return;
		state.startingPoints = state.startingPoints.filter((_sp: StartingPoint, i: number) => i !== index);
	}

	function updateStartingPoint(index: number, field: keyof StartingPoint, value: string | number) {
		state.startingPoints = state.startingPoints.map((sp: StartingPoint, i: number) =>
			i === index ? { ...sp, [field]: value } : sp
		);
	}

	function handleExport() {
		console.log('PromptBookEditor handleExport called');
		console.log('state:', state);
		downloadToml(state);
	}

	function handleStateChange(newState: PromptBookState) {
		state = newState;
	}

	function togglePreview() {
		// Handled by parent
	}
</script>

<div class="editor-container">
	<EditorHeader
		{state}
		{showPreview}
		onTogglePreview={togglePreview}
		onStateChange={handleStateChange}
		onExport={handleExport}
	/>

	<div class="editor-body" class:show-preview={showPreview}>
		<div class="form-columns">
			<FormBookInfo {state} />
			<FormStartingPoints
				startingPoints={state.startingPoints}
				onAdd={addStartingPoint}
				onRemove={removeStartingPoint}
				onUpdate={updateStartingPoint}
			/>
			<FormSystemPrompt {state} />
		</div>

		{#if showPreview}
			<PreviewPanel {state} />
		{/if}
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
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-lg);
		padding: var(--space-lg);
		flex: 1;
		overflow: auto;
	}

	.editor-body.show-preview {
		grid-template-columns: 1fr 1fr;
	}

	.form-columns {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	/* Desktop: Two columns */
	@media (min-width: 1024px) {
		.editor-body {
			grid-template-columns: 1fr 1fr;
		}

		.editor-body.show-preview {
			grid-template-columns: 1fr 1fr;
		}

		.form-columns {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-lg);
		}
	}

	/* Tablet */
	@media (max-width: 1023px) and (min-width: 768px) {
		.editor-body {
			grid-template-columns: 1fr;
		}

		.form-columns {
			display: flex;
			flex-direction: column;
		}
	}

	/* Mobile */
	@media (max-width: 767px) {
		.editor-body {
			padding: var(--space-md);
			gap: var(--space-md);
		}

		.form-columns {
			gap: var(--space-md);
		}
	}

	/* Small mobile */
	@media (max-width: 480px) {
		.editor-body {
			padding: var(--space-sm);
		}
	}
</style>