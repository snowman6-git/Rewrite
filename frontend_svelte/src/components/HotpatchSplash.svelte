<script lang="ts">
	import { patchStatus } from '$lib/hotpatch/loader.svelte';
	import Icon from '$components/Common/Icon.svelte';

	let { manual = false } = $props();

	// 실제 패치 진행(다운로드/적용) 때만 풀스크린 — 'checking'만은 스플래시 X (hub 타임아웃 5초 가림막 제거)
	// 수동(설정)은 카드에서 진행률 표시
	let active = $derived(!manual && ['downloading', 'applying'].includes(patchStatus.phase));
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
		{#if patchStatus.phase === 'downloading'}
			<div
				class="pbar"
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={100}
				aria-valuenow={patchStatus.total > 0 ? pct : undefined}
			>
				<div
					class="fill"
					class:indeterminate={patchStatus.total <= 0}
					style:width={patchStatus.total > 0 ? `${pct}%` : '100%'}
				></div>
			</div>
			<p class="pct">{patchStatus.total > 0 ? `${pct}%` : ''}</p>
		{:else}
			<div class="pbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}>
				<div class="fill" style:width="100%"></div>
			</div>
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
		min-height: 1em;
	}

	.pbar {
		width: min(240px, 60vw);
		height: 4px;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		overflow: hidden;
		background: var(--color-bg-tertiary);
	}

	.fill {
		height: 100%;
		background: var(--color-accent-primary);
		transition: width var(--transition-fast);
	}

	.fill.indeterminate {
		width: 40% !important;
		animation: pbar-slide 1.2s ease-in-out infinite;
	}

	@keyframes pbar-slide {
		0% {
			transform: translateX(-110%);
		}
		100% {
			transform: translateX(275%);
		}
	}
</style>
