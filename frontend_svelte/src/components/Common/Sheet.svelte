<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import { backEntry } from '$lib/utils/back-entry';
	import Overlay from './Overlay.svelte';

	// 바텀 시트 공용 언어: ModelListMenu(패딩 X)·characters(패딩 O)를 통일
	let {
		onClose,
		padded = true,
		children
	}: {
		onClose: () => void;
		padded?: boolean;
		children: import('svelte').Snippet;
	} = $props();

	// 포털: 시트를 body로 이식 — 버블 시트처럼 .msg-row 내부에서 렌더되면 fixed+z999에도
	// 인풋(transform 스택 컨텍스트)이 front로 그려지는 함정 (2026-11-01 AVD/브라우저 실측으로 확인,
	// body 이식 시 front 복귀). position:fixed라 레이아웃 변화 없음.
	let wrap: HTMLDivElement;
	$effect(() => {
		document.body.appendChild(wrap);
		return () => {
			// eslint-disable-next-line svelte/no-dom-manipulating -- 포털: body로 이식한 노드는 Svelte가 추적하지 않아 수동 제거가 필수 (공식 포털 원시不存在)
			wrap?.remove();
		};
	});

	// 뒤로가기 = 시트 닫기 (히스토리 entry, 2026-10-27) / Escape = 시트 닫기 (2026-10-27 P1-5)
	onMount(() => {
		const un = backEntry(onClose);
		function onKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose();
		}
		window.addEventListener('keydown', onKeydown);
		return () => {
			un?.();
			window.removeEventListener('keydown', onKeydown);
		};
	});
</script>

<div bind:this={wrap}>
	<Overlay zIndex={998} onclick={onClose} />
	<div
		class="sheet"
		class:padded
		role="group"
		in:fly={{ y: 100, duration: 250, easing: cubicOut }}
		out:fly={{ y: 100, duration: 250, easing: cubicOut }}
	>
		{@render children()}
	</div>
</div>

<style>
	.sheet {
		position: fixed;
		/* bottom:0 — 시트가 인풋을 덮는 게 의도 (시트 z999 > 인풋 auto). 인풋 z-index 제거로 메뉴가 front */
		bottom: 0;
		left: 0;
		right: 0;
		z-index: var(--z-sheet);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border-strong);
		border-bottom: none;
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
		display: flex;
		flex-direction: column;
		user-select: none;
		-webkit-user-select: none;
		/* 제스처 바에 마지막 항목이 묻히지 않게 (2026-10-27 P1-6) */
		padding-bottom: env(safe-area-inset-bottom);
	}

	.sheet.padded {
		padding: var(--space-md);
		padding-bottom: calc(var(--space-md) + env(safe-area-inset-bottom));
		gap: var(--space-md);
		max-height: 80dvh;
		overflow-y: auto;
	}
</style>
