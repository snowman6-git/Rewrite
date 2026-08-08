<script lang="ts">
	let { children } = $props();
	import { page } from '$app/stores';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import MainContent from '$lib/components/layout/MainContent.svelte';

	let showPreview = $derived($page.url.searchParams.get('preview') === 'true');
</script>

<div id="app-layout">
	<Sidebar {showPreview} />
	<MainContent>
		{@render children()}
	</MainContent>
</div>

<style>
	#app-layout {
		display: flex;
		height: 100dvh;
		width: 100dvw;
	}

	:global(html, body) {
		margin: 0;
		padding: 0;
		height: 100dvh;
		overflow: hidden;
	}
</style>