<script lang="ts">
	let { children } = $props();
</script>

<main class="main-content">
	{@render children()}
</main>

<style>
	.main-content {
		flex: 1;
		margin-left: 220px;
		overflow-y: auto;
		height: 100vh;
		background: var(--color-bg-primary);
		position: relative;
		scroll-behavior: smooth;
	}

	/* Smooth scrolling */
	.main-content::-webkit-scrollbar {
		width: 8px;
	}

	.main-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.main-content::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: var(--radius-full);
		transition: background var(--transition-fast);
	}

	.main-content::-webkit-scrollbar-thumb:hover {
		background: var(--color-text-tertiary);
	}

	/* Tablet */
	@media (max-width: 1024px) {
		.main-content {
			margin-left: 64px;
		}
	}

	/* Mobile */
	@media (max-width: 768px) {
		.main-content {
			margin-left: 0;
			height: 100vh;
			padding-top: 0;
		}
	}

	/* Mobile sidebar open state */
	:global(body.sidebar-open .main-content) {
		padding-left: 260px;
	}

	/* Desktop padding for better readability */
	@media (min-width: 1025px) {
		.main-content {
			padding: var(--space-xl) var(--space-2xl);
		}
	}

	/* Tablet padding */
	@media (max-width: 1024px) and (min-width: 769px) {
		.main-content {
			padding: var(--space-lg) var(--space-xl);
		}
	}

	/* Mobile padding */
	@media (max-width: 768px) {
		.main-content {
			padding: var(--space-md);
		}
	}

	/* Landscape optimization: reduced padding for wider screens */
	@media (min-width: 1280px) and (orientation: landscape),
	       (min-width: 1280px) and (min-height: 600px) {
		.main-content {
			padding: var(--landscape-padding-y, var(--space-lg)) var(--landscape-padding-x, var(--space-2xl));
		}
	}

	/* Large screen (1920px+) */
	@media (min-width: 1920px) and (orientation: landscape),
	       (min-width: 1920px) and (min-height: 800px) {
		.main-content {
			padding: var(--space-2xl) var(--large-screen-padding-x, 5rem);
		}
	}
</style>