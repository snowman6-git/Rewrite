<script lang="ts">
	let { text, hint = '' }: { text: string; hint?: string } = $props();
</script>

<div class="empty-state">
	<p class="empty-text">{text}</p>
	{#if hint}<p class="empty-hint">{hint}</p>{/if}
</div>

<!-- 스타일: lib/assets/app.css 전역(.empty-state/.empty-text/.empty-hint) -->
