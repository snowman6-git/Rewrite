<script lang="ts">
	import Icon from '$components/Common/Icon.svelte';
</script>

<button class="back-btn" onclick={() => window.history.back()} aria-label="뒤로가기">
	<Icon name="chevron-left" size={20} />
</button>

<style>
	.back-btn {
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background var(--transition-fast);
	}

	.back-btn:hover {
		background: var(--color-bg-hover);
	}
</style>
