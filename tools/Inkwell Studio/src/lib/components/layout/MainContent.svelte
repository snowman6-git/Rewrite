<script lang="ts">
	let { children } = $props();
</script>

<main class="main-content">
	{@render children()}
</main>

<style>
	.main-content {
		flex: 1;
		margin-left: 200px;
		overflow-y: auto;
		height: 100vh;
		background: var(--color-bg-primary);
	}

	/* Tablet */
	@media (max-width: 1024px) {
		.main-content {
			margin-left: 60px;
		}
	}

	/* Mobile */
	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
			height: calc(100vh - 56px);
		}
	}
</style>