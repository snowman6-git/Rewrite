<script lang="ts">
	import PromptBookEditor from '../lib/components/PromptBookEditor.svelte';
</script>

<svelte:head>
	<title>Inkwell Studio</title>
</svelte:head>

<PromptBookEditor />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		height: 100dvh;
		overflow: hidden;
	}
</style>
