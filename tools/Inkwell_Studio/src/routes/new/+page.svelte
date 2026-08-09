<script lang="ts">
	// Tauri invoke 대신 순수 Svelte 스토어만 사용 (추후 웹 이식을 고려)
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { createNewBook } from '$lib/stores/promptBook.svelte.js';

	onMount(() => {
		createNewBook();
		goto('/');
	});
</script>

<style>
</style>
