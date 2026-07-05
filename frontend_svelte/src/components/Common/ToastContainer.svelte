<script lang="ts">
	import Toast from './Toast.svelte';
	import { toast } from '$lib/stores/toast.svelte';
</script>

<div class="toast-container">
	{#each toast.queue as t (t.id)}
		<Toast toast={t} />
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: var(--space-lg);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		z-index: 9999;
	}

	@media (max-width: 640px) {
		.toast-container {
			top: var(--space-md);
			left: var(--space-md);
			right: var(--space-md);
			transform: none;
			width: auto;
		}
	}
</style>
