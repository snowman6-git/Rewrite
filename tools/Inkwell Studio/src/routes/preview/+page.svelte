<script lang="ts">
	import PromptBookEditor from '$lib/components/PromptBookEditor.svelte';
	import { initialState } from '$lib/types/prompt-book.js';
	import { page } from '$app/stores';

	// URL 파라미터에서 state를 가져옴 (JSON 문자열)
	let stateFromUrl = $derived($page.url.searchParams.get('state'));
	let editorState = $state(initialState);

	if (stateFromUrl) {
		try {
			editorState = JSON.parse(decodeURIComponent(stateFromUrl));
		} catch (error) {
			console.error('Failed to parse state from URL:', error);
		}
	}
</script>

<PromptBookEditor state={editorState} showPreview={true} />