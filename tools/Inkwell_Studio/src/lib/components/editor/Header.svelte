<script lang="ts">
	import { book, createNewBook, replaceBook } from '../../stores/promptBook.svelte.js';
	import { downloadToml, loadTomlFromFile, validateState } from '../../utils/toml.js';
	import InkButton from '../common/Button.svelte';

	let errors = $state<string[]>([]);
	let fileInput: HTMLInputElement;

	function hasContent(): boolean {
		return (
			book.coverTitle.trim() !== '' ||
			book.coverDesc.trim() !== '' ||
			book.systemPrompt.trim() !== '' ||
			book.startingPoints.some((sp) => sp.name.trim() !== '' || sp.content.trim() !== '')
		);
	}

	// 내보내기 이후 새 책을 시작할 때를 위한 초기화 (ID도 새로 발급됨)
	function handleReset() {
		if (hasContent() && !confirm('현재 작성 중인 내용을 지우고 새 책을 시작할까요? (ID도 새로 발급됩니다)')) {
			return;
		}
		errors = [];
		createNewBook();
	}

	function handleExport() {
		errors = validateState(book);
		if (errors.length > 0) {
			return;
		}
		downloadToml(book);
	}

	async function handleImport(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		try {
			const file = input.files[0];
			const newState = await loadTomlFromFile(file);
			replaceBook(newState);
			errors = [];
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

		<InkButton variant="danger" onclick={handleReset}>
			↺ 초기화
		</InkButton>

		<InkButton variant="secondary" onclick={() => fileInput.click()}>
			불러오기
		</InkButton>

		<InkButton variant="secondary" href="/preview">
			🔎 미리보기
		</InkButton>

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

	/* Mobile / 세로(portrait) 좁은 화면 */
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

	/* 가로(landscape)로 짧은 높이일 때: 헤더를 컴팩트하게 */
	@media (orientation: landscape) and (max-height: 480px) {
		.editor-header {
			padding: var(--space-xs) var(--space-md);
		}

		.header-title {
			font-size: var(--font-size-lg);
		}
	}
</style>
