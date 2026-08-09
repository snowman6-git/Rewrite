<script lang="ts">
	import { book } from '$lib/stores/promptBook.svelte.js';
	import { downloadToml } from '$lib/utils/toml.js';
	import PreviewPanel from '$lib/components/editor/PreviewPanel.svelte';
</script>

<svelte:head>
	<title>미리보기 - Inkwell Studio</title>
</svelte:head>

<div class="preview-page">
	<div class="preview-topbar">
		<div class="preview-heading">
			<h1 class="preview-title">{book.coverTitle || '(제목 없음)'}</h1>
			<p class="preview-subtitle">홈에서 편집한 내용이 실시간으로 반영됩니다</p>
		</div>
		<button class="download-btn" onclick={() => downloadToml(book)}>⬇ TOML 다운로드</button>
	</div>

	<div class="preview-body">
		<PreviewPanel state={book} />
	</div>
</div>

<style>
	.preview-page {
		height: 100%;
		width: 100%;
		display: flex;
		flex-direction: column;
		padding: var(--space-xl);
		gap: var(--space-lg);
		max-width: 1100px;
		margin: 0 auto;
	}

	.preview-topbar {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.preview-heading {
		min-width: 0;
	}

	.preview-title {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
		word-break: break-word;
	}

	.preview-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: var(--space-xs) 0 0 0;
	}

	.download-btn {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-lg);
		background: var(--color-accent-primary);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.download-btn:hover {
		background: var(--color-accent-secondary);
		box-shadow: var(--shadow-glow);
	}

	.preview-body {
		flex: 1;
		min-height: 0;
		display: flex;
	}

	/* Tablet */
	@media (max-width: 1024px) {
		.preview-page {
			padding: var(--space-lg);
		}
	}

	/* Mobile / 세로(portrait) */
	@media (max-width: 768px) {
		.preview-page {
			padding: var(--space-md);
			gap: var(--space-md);
		}

		.preview-title {
			font-size: var(--font-size-xl);
		}

		.download-btn {
			width: 100%;
			justify-content: center;
		}
	}
</style>
