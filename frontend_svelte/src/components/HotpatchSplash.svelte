<script lang="ts">
	import { patchStatus } from '$lib/hotpatch/loader.svelte';
	import Icon from '$components/Common/Icon.svelte';

	let { manual = false } = $props();

	// 실제 패치 진행(확인/다운로드/적용) 때만 풀스크린. 수동(설정)은 카드에서 진행률 표시
	let active = $derived(!manual && ['checking', 'downloading', 'applying'].includes(patchStatus.phase));
	let label = $derived(
		patchStatus.phase === 'checking' ? '확인중' : patchStatus.phase === 'applying' ? '적용중' : '다운로드중'
	);
	let pct = $derived(
		patchStatus.total > 0 ? Math.min(100, Math.round((patchStatus.received / patchStatus.total) * 100)) : 0
	);
</script>

{#if active}
	<div class="splash" role="status" aria-live="polite">
		<span class="icon"><Icon name="download" size={30} /></span>
		<p class="title">UI/UX 패치 {label}…</p>
		{#if patchStatus.phase === 'downloading' && patchStatus.total > 0}
			<p class="pct">{pct}%</p>
		{/if}
	</div>
{/if}

<style>
	.splash {
		position: fixed;
		inset: 0;
		z-index: 9999;
		background: var(--color-bg-primary);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		color: var(--color-text-secondary);
	}

	.icon {
		display: block;
		line-height: 0;
	}

	.title {
		margin: 0;
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	.pct {
		margin: 0;
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}
</style>
