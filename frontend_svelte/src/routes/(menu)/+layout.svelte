<script lang="ts">
	import '$lib/assets/app.css';
	import { page } from '$app/stores';
	let { children } = $props();
	const tabs = [
		{ id: 'book', label: '책장', icon: '📚', href: '/book' },
		{ id: 'production', label: '제작', icon: '✍️', href: '/production' },
		{ id: 'settings', label: '설정', icon: '⚙️', href: '/settings' },
		{ id: 'profile', label: '프로필', icon: '👤', href: '/profile' }
	];

	let activeTab = $derived(tabs.find(t => $page.url.pathname.startsWith(t.href))?.id ?? 'book');

	// Context menu is handled by individual sections (BookSection, ProductionSection, etc.)
	// No global context menu listener needed
</script>

<div class="app-layout">
	<!-- Header -->
	<header class="app-header">
		<div class="header-content">
			<div class="header-brand">
				<img src="/rewrite-logo.png" alt="Rewrite Logo" class="header-logo" />
				<h1 class="app-title">Rewrite</h1>
			</div>
			<div class="header-actions">
				<button class="header-btn">🔍</button>
				<button class="header-btn">⚙️</button>
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
				<a 
					href={tab.href} 
					class="nav-item"
					class:active={activeTab === tab.id}
				>
					<span class="nav-icon">{tab.icon}</span>
					<span class="nav-label">{tab.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>

<style>
	.app-layout {
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg-primary);
	}

	.app-header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: var(--color-bg-primary);
		border-bottom: 1px solid var(--color-border);
		height: var(--header-height);
		display: flex;
		align-items: center;
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--space-md);
	}

	.header-brand {
		display: flex;
		align-items: center;
		gap: 0;
	}

	.header-logo {
		height: 36px;
		width: auto;
		object-fit: contain;
	}

	.app-title {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.header-actions {
		display: flex;
		gap: var(--space-sm);
	}

	.header-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.header-btn:hover {
		background: var(--color-bg-tertiary);
	}

	.app-main {
		flex: 1;
		padding-top: var(--header-height);
		padding-bottom: 70px;
		overflow-y: auto;
	}

	.app-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background: var(--color-bg-primary);
		border-top: 1px solid var(--color-border);
		height: 60px;
		display: flex;
		align-items: center;
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
		.app-main {
			padding-top: var(--header-height);
			padding-bottom: 60px;
		}

		.nav-item {
			min-width: 50px;
			padding: var(--space-2xs) var(--space-xs);
		}

		.nav-icon {
			font-size: 1.25rem;
		}

		.nav-label {
			font-size: 0.65rem;
		}
	}
</style>