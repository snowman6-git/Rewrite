<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>설정 - Inkwell Studio</title>
</svelte:head>

<div class="settings-page">
	<h1 class="page-title">설정</h1>
	<p class="page-description">프로젝트 설정을 관리합니다</p>

	<div class="settings-section">
		<h2 class="section-title">기본 설정</h2>
		<div class="setting-item">
			<label class="setting-label" for="apiEndpoint">API 엔드포인트</label>
			<input
				id="apiEndpoint"
				type="text"
				class="setting-input"
				placeholder="http://localhost:8080"
			/>
		</div>
	</div>

	<div class="settings-section">
		<h2 class="section-title">디버깅</h2>
		<div class="setting-item">
			<label class="setting-label" for="logLevel">로그 레벨</label>
			<select id="logLevel" class="setting-select">
				<option value="info">Info</option>
				<option value="debug">Debug</option>
				<option value="error">Error</option>
			</select>
		</div>
	</div>
</div>

<style>
	.settings-page {
		padding: var(--space-2xl);
		max-width: 800px;
		margin: 0 auto;
	}

	.page-title {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-md) 0;
	}

	.page-description {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-2xl) 0;
	}

	.settings-section {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
		margin-bottom: var(--space-lg);
	}

	.section-title {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-lg) 0;
		padding-bottom: var(--space-md);
		border-bottom: 1px solid var(--color-border);
	}

	.setting-item {
		margin-bottom: var(--space-md);
	}

	.setting-label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-sm);
	}

	.setting-input,
	.setting-select {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-family: var(--font-family);
		font-size: var(--font-size-base);
		transition: all var(--transition-fast);
	}

	.setting-input:focus,
	.setting-select:focus {
		outline: none;
		border-color: var(--color-accent-primary);
		box-shadow: var(--shadow-glow);
	}

	/* Mobile */
	@media (max-width: 768px) {
		.settings-page {
			padding: var(--space-lg);
		}

		.page-title {
			font-size: var(--font-size-2xl);
		}
	}
</style>