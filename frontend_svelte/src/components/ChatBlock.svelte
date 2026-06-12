<script lang="ts">
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	let { text } = $props<{
		text: string;
	}>();
</script>

<div id="panel">
	{@html marked(DOMPurify.sanitize(text))}
</div>

<style>
	#panel {
	}
</style>
