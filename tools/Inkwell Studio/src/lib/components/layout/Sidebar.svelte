<script lang="ts">
	import { page } from '$app/stores';

	let { showPreview = false } = $props<{ showPreview?: boolean }>();

	let previewActive = $derived($page.url.pathname === '/preview');

	let mobileMenuOpen = $state(false);
</script>

<nav class="sidebar" class:open={mobileMenuOpen}>
	<div class="sidebar-header">
		<h1 class="logo">Inkwell</h1>
		<button class="mobile-toggle" onclick={() => (mobileMenuOpen = !mobileMenuOpen)}>
			☰
		</button>
	</div>

	<div class="sidebar-nav">
		<a class="nav-item" href="/" onclick={() => (mobileMenuOpen = false)}>
			<span class="nav-icon">🏠</span>
			<span class="nav-text">홈</span>
		</a>
		<a class="nav-item" href="/preview" onclick={() => (mobileMenuOpen = false)} class:active={previewActive}>
			<span class="nav-icon">👁️</span>
			<span class="nav-text">미리보기</span>
		</a>
		<a class="nav-item" href="/settings" onclick={() => (mobileMenuOpen = false)}>
			<span class="nav-icon">⚙️</span>
			<span class="nav-text">설정</span>
		</a>
	</div>
</nav>

<style>
	.sidebar {
		width: 200px;
		height: 100vh;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--color-border);
		background-color: var(--color-bg-secondary);
		position: fixed;
		left: 0;
		top: 0;
		z-index: 100;
		transition: transform var(--transition-base);
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md);
		border-bottom: 1px solid var(--color-border);
	}

	.logo {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-accent-primary);
		margin: 0;
	}

	.mobile-toggle {
		display: none;
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		font-size: var(--font-size-2xl);
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		padding: var(--space-sm) 0;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		text-decoration: none;
		color: var(--color-text-secondary);
		border: none;
		background: none;
		cursor: pointer;
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		transition: all var(--transition-fast);
		width: 100%;
		text-align: left;
	}

	.nav-item:hover {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.nav-item.active {
		background: var(--color-accent-glow);
		color: var(--color-accent-primary);
		border-right: 2px solid var(--color-accent-primary);
	}

	.nav-icon {
		font-size: var(--font-size-lg);
	}

	.nav-text {
		white-space: nowrap;
	}

	/* Tablet */
	@media (max-width: 1024px) {
		.sidebar {
			width: 60px;
		}

		.logo {
			font-size: var(--font-size-base);
		}

		.nav-text {
			display: none;
		}

		.nav-item {
			justify-content: center;
			padding: var(--space-sm);
		}

		.nav-item.active {
			border-right: none;
			border-bottom: 2px solid var(--color-accent-primary);
		}
	}

	/* Mobile */
	@media (max-width: 768px) {
		.sidebar {
			transform: translateX(-100%);
		}

		.sidebar.open {
			transform: translateX(0);
		}

		.mobile-toggle {
			display: block;
		}

		.sidebar-header {
			padding: var(--space-sm);
		}
	}
</style>