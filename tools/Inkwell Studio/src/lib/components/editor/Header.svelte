<script lang="ts">
	import type { PromptBookState } from '../../types/prompt-book.js';
	import { downloadToml, loadTomlFromFile } from '../../utils/toml.js';
	import { validateState } from '../../utils/toml.js';
	import InkButton from '../common/Button.svelte';

	let {
		state: modelState,
		showPreview = false,
		onStateChange,
		onExport
	} = $props<{
		state: PromptBookState;
		showPreview?: boolean;
		onStateChange?: (newState: PromptBookState) => void;
		onExport?: () => void;
	}>();

	// URL에 현재 상태 전달
	let previewUrl = $derived(`/preview?state=${encodeURIComponent(JSON.stringify(modelState))}`);

	let errors = $state<string[]>([]);
	let fileInput: HTMLInputElement;

	function handleExport() {
		console.log('handleExport called');
		console.log('modelState:', modelState);
		errors = validateState(modelState);
		console.log('errors:', errors);
		if (errors.length > 0) {
			console.log('Validation failed, returning early');
			return;
		}
		console.log('Calling onExport...');
		onExport?.();
	}

	async function handleImport(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		try {
			const file = input.files[0];
			const newState = await loadTomlFromFile(file);
			onStateChange?.(newState);
		} catch (error) {
			console.error('Failed to load TOML file:', error);
			alert('TOML 파일을 불러오는 데 실패했습니다.');
		}

		input.value = '';
	}
</script>

<header class="editor-header">
	<div class="header-left">
		<h1 class="header-title">Inkwell Studio</h1>
	</div>

	<div class="header-actions">
		<input
			type="file"
			accept=".toml"
			class="hidden"
			bind:this={fileInput}
			onchange={handleImport}
		/>

		<InkButton variant="secondary" onclick={() => fileInput.click()}>
			불러오기
		</InkButton>

		<a class="ink-btn secondary" href={previewUrl}>
			👁️ 미리보기
		</a>

		<InkButton variant="primary" onclick={handleExport}>
			내보내기
		</InkButton>
	</div>
</header>

{#if errors.length > 0}
	<div class="error-banner">
		{#each errors as error}
			<p>{error}</p>
		{/each}
	</div>
{/if}

<style>
	.editor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		background: var(--color-bg-secondary);
		gap: var(--space-md);
	}

	.header-title {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
	}

	.header-actions {
		display: flex;
		gap: var(--space-sm);
		align-items: center;
		flex-wrap: wrap;
	}

	.hidden {
		display: none;
	}

	.error-banner {
		background: var(--color-error);
		color: white;
		padding: var(--space-md);
		border-radius: var(--radius-md);
		margin: var(--space-md);
	}

	.error-banner p {
		margin: 0;
		font-size: var(--font-size-sm);
	}

	/* Mobile */
	@media (max-width: 768px) {
		.editor-header {
			flex-direction: column;
			align-items: flex-start;
			padding: var(--space-sm) var(--space-md);
			gap: var(--space-sm);
		}

		.header-actions {
			width: 100%;
			justify-content: flex-end;
		}
	}

	/* Small mobile */
	@media (max-width: 480px) {
		.header-title {
			font-size: var(--font-size-base);
		}

		.header-actions {
			flex-wrap: wrap;
		}

		.header-actions > * {
			flex: 1;
			min-width: 80px;
		}
	}
</style>