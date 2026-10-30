<script lang="ts">
	import { page } from '$app/stores';

	// WebView opaque-origin 캐시 키는 기기/버전마다 다름 — hp{N} 경로로도 구 index가 서빙될 수 있어.
	// 구조: 재시작 = 세션 내 최신 문서로 복귀 — local/index.html은 이번 부팅에서 막 받아온
	// active 패치 문서라 pathname '/'로 SvelteKit이 정상 부팅 (hp{N}/은 SPA 404)
	// (구: /local/rescue-{ts}/ 경로 — 핸들러 미매칭 → 서버 404 dead-end. 2026-11-01 수정)
	function rescue() {
		const ts = Date.now();
		location.replace(`${location.protocol}//${location.host}/local/index.html?rescue=${ts}`);
	}
</script>

<div class="error-page">
	<div class="error-code">404</div>
	<p class="error-msg">경로를 찾을 수 없어요.</p>
	{#if $page.status === 404}
		<button class="error-btn" onclick={rescue}>재시작</button>
	{/if}
</div>

<style>
	.error-page {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		gap: var(--space-sm);
		padding: var(--space-lg);
		background: var(--color-bg-primary);
		color: var(--color-text-primary);
	}

	.error-code {
		font-size: 4rem;
		font-weight: 700;
		line-height: 1;
		color: var(--color-text-tertiary);
	}

	.error-msg {
		font-size: var(--font-size-md);
		color: var(--color-text-secondary);
	}

	.error-btn {
		margin-top: var(--space-md);
		padding: var(--space-sm) var(--space-lg);
		border: none;
		border-radius: var(--radius-md);
		background: var(--color-accent-primary);
		color: var(--color-bg-primary);
		font-size: var(--font-size-md);
		font-weight: 600;
		cursor: pointer;
	}
</style>
