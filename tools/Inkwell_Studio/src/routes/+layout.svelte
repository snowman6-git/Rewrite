<script lang="ts">
	let { children } = $props();
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import MainContent from '$lib/components/layout/MainContent.svelte';
	import { book, persistBook } from '$lib/stores/promptBook.svelte.js';

	// 홈 ↔ 미리보기 등 어떤 라우트에서 상태가 바뀌든 한 곳에서 자동 저장한다.
	$effect(() => {
		// JSON.stringify가 book의 모든 필드를 읽어 의존성으로 추적하게 만든다.
		JSON.stringify(book);
		persistBook();
	});
</script>

<div id="app-layout">
	<Sidebar />
	<MainContent>
		{@render children()}
	</MainContent>
</div>

<style>
	#app-layout {
		display: flex;
		height: 100dvh;
		width: 100dvw;
		position: relative;
	}

	:global(html, body) {
		margin: 0;
		padding: 0;
		height: 100dvh;
		overflow: hidden;
	}

	/* Mobile header for easy menu access */
	@media (max-width: 768px) {
		#app-layout::before {
			content: '';
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			height: 4px;
			background: var(--color-accent-gradient);
			z-index: 99;
			opacity: 0;
			transition: opacity var(--transition-base);
		}

		#app-layout:hover::before,
		#app-layout:active::before {
			opacity: 1;
		}
	}
</style>