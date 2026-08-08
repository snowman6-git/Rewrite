<script lang="ts">
	import '$lib/assets/app.css';
	import { page } from '$app/stores';
	let { children } = $props();
	const tabs = [
		{ id: 'book', label: '책장', icon: '📚', href: '/book' },
		{ id: 'production', label: '제작', icon: '🎨', href: '/production' },
		{ id: 'desk', label: '서재', icon: '🖊️', href: '/desk' },
		{ id: 'characters', label: '등장인물', icon: '👥', href: '/characters' },
		{ id: 'settings', label: '설정', icon: '⚙️', href: '/settings' }
	];

	let activeTab = $derived(tabs.find((t) => $page.url.pathname.startsWith(t.href))?.id ?? 'book');
</script>

<div class="app-layout">
	<!-- Header -->
	<header class="app-header">
		<div class="header-content">
			<div class="header-brand">
				<img src="/rewrite-logo.png" alt="Rewrite Logo" class="header-logo" />
				<h1 class="app-title">Rewrite</h1>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="app-main">
		{@render children?.()}
	</main>

	<!-- Bottom Navigation -->
	<nav class="app-nav">
		<div class="nav-container">
			{#each tabs as tab (tab.id)}
				<a href={tab.href} class="nav-item" class:active={activeTab === tab.id}>
					<span class="nav-icon">{tab.icon}</span>
					<span class="nav-label">{tab.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>

<style>
	.app-layout {
		height: 100dvh;
		background: var(--color-bg-primary);
		display: flex;
		flex-direction: column;
		/* overflow: hidden; */
	}

	.app-header {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		background: var(--color-bg-primary);
		border-bottom: 1px solid var(--color-border);
		display: flex;
		align-items: center;
		z-index: 100;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		height: var(--header-height);
		padding: 0 var(--space-md);
	}

	.header-brand {
		display: flex;
		align-items: center;
		gap: var(--space-2xs);
	}

	.header-logo {
		height: 32px;
		width: auto;
		object-fit: contain;
	}

	@media (max-width: 640px) {
		.header-brand {
			gap: var(--space-3xs);
		}

		.header-logo {
			height: 24px;
		}

		.app-title {
			font-size: var(--font-size-base);
		}
	}

	.app-title {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-text-primary);
	}
	.app-main {
		display: flex;
		height: 100%;
		max-height: 100%;
		padding-top: 3.5rem;
		padding-bottom: 4rem;
	}
	.app-nav {
		background: var(--color-bg-primary);
		border-top: 1px solid var(--color-border);
		height: 4rem;
		width: 100%;
		display: flex;
		align-items: center;
		position: fixed;
		bottom: 0;
		left: 0;
		z-index: 100;
	}

	.nav-container {
		display: flex;
		justify-content: space-around;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--space-xs);
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: var(--space-2xs) var(--space-sm);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		text-decoration: none;
		cursor: pointer;
		transition: all var(--transition-fast);
		border-radius: var(--radius-md);
		min-width: 60px;
	}

	.nav-item:hover {
		color: var(--color-text-primary);
		background: var(--color-bg-secondary);
	}

	.nav-item.active {
		color: var(--color-accent-primary);
	}

	.nav-icon {
		font-size: 1.5rem;
	}

	.nav-label {
		font-size: var(--font-size-xs);
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.nav-item {
			min-width: 48px;
			padding: var(--space-2xs) var(--space-xs);
		}

		.nav-icon {
			font-size: 1.1rem;
		}

		.nav-label {
			font-size: 0.6rem;
		}
	}
</style>
