<script lang="ts">
	import PromptBookEditor from '../lib/components/PromptBookEditor.svelte';
	import { initialState } from '../lib/types/prompt-book.js';
	import { page } from '$app/stores';

	let editorState = $state(initialState);
	let showPreview = $derived($page.url.searchParams.get('preview') === 'true');
</script>

<PromptBookEditor state={editorState} {showPreview} />

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		height: 100dvh;
		overflow: hidden;
	}
</style>