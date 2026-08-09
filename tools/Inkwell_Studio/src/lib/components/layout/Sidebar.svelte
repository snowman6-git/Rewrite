<script lang="ts">
	import { page } from '$app/stores';

	let previewActive = $derived($page.url.pathname === '/preview');

	let mobileMenuOpen = $state(false);

	function toggleBodyClass() {
		if (mobileMenuOpen) {
			document.body.classList.add('sidebar-open');
		} else {
			document.body.classList.remove('sidebar-open');
		}
	}

	$effect(() => {
		toggleBodyClass();
	});
</script>

<nav class="sidebar" class:open={mobileMenuOpen}>
	<div class="sidebar-header">
		<h1 class="logo" aria-label="Inkwell Studio">🖋️</h1>
		<button class="mobile-toggle" onclick={() => (mobileMenuOpen = !mobileMenuOpen)} aria-label="메뉴 열기">
			☰
		</button>
	</div>

	<div class="sidebar-nav">
		<a class="nav-item" href="/" onclick={() => (mobileMenuOpen = false)}>
			<span class="nav-icon">🏠</span>
			<span class="nav-text">홈</span>
		</a>
		<a class="nav-item" href="/preview" onclick={() => (mobileMenuOpen = false)} class:active={previewActive}>
			<span class="nav-icon">🔎</span>
			<span class="nav-text">미리보기</span>
		</a>
		<a class="nav-item" href="/settings" onclick={() => (mobileMenuOpen = false)}>
			<span class="nav-icon">⚙️</span>
			<span class="nav-text">설정</span>
		</a>
	</div>
</nav>

{#if mobileMenuOpen}
	<div class="overlay" onclick={() => (mobileMenuOpen = false)} onkeydown={(e) => e.key === 'Escape' && (mobileMenuOpen = false)} role="button" tabindex="0" aria-label="메뉴 닫기"></div>
{/if}

<style>
	.sidebar {
		width: 220px;
		height: 100vh;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--color-border);
		background: linear-gradient(180deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%);
		position: fixed;
		left: 0;
		top: 0;
		z-index: 100;
		transition: transform var(--transition-base);
		box-shadow: var(--shadow-md);
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		background: rgba(99, 102, 241, 0.05);
	}

	.logo {
		font-size: var(--font-size-2xl);
		margin: 0;
		line-height: 1;
		filter: drop-shadow(0 0 6px var(--color-accent-glow));
	}

	.mobile-toggle {
		display: none;
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		font-size: var(--font-size-2xl);
		cursor: pointer;
		padding: 0;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);
	}

	.mobile-toggle:hover {
		background: var(--color-bg-hover);
		color: var(--color-accent-primary);
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		padding: var(--space-sm);
		gap: 2px;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
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
		border-radius: var(--radius-md);
		position: relative;
		overflow: hidden;
	}

	.nav-item::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		width: 3px;
		height: 100%;
		background: var(--color-accent-primary);
		transform: scaleY(0);
		transition: transform var(--transition-fast);
	}

	.nav-item:hover {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
		padding-left: var(--space-lg);
	}

	.nav-item.active {
		background: var(--color-accent-glow);
		color: var(--color-accent-primary);
		font-weight: 600;
	}

	.nav-item.active::before {
		transform: scaleY(1);
	}

	.nav-icon {
		font-size: var(--font-size-xl);
		width: 24px;
		text-align: center;
		transition: transform var(--transition-spring);
	}

	.nav-item:hover .nav-icon {
		transform: scale(1.1);
	}

	.nav-text {
		white-space: nowrap;
		font-weight: 500;
	}

	/* Tablet */
	@media (max-width: 1024px) {
		.sidebar {
			width: 64px;
		}

		.sidebar-header {
			padding: var(--space-md);
		}

		.logo {
			font-size: var(--font-size-xl);
		}

		.nav-text {
			display: none;
		}

		.nav-item {
			justify-content: center;
			padding: var(--space-md);
		}

		.nav-item:hover {
			padding-left: var(--space-md);
		}

		.nav-item.active::before {
			width: 100%;
			height: 3px;
			top: auto;
			bottom: 0;
			transform: scaleX(0);
		}

		.nav-item.active::before {
			transform: scaleX(1);
		}
	}

	/* Mobile */
	@media (max-width: 768px) {
		.sidebar {
			transform: translateX(-100%);
			width: 260px;
			box-shadow: var(--shadow-xl);
		}

		.sidebar.open {
			transform: translateX(0);
			animation: slideIn 0.3s var(--transition-spring);
		}

		.mobile-toggle {
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.sidebar-header {
			padding: var(--space-md);
		}

		.overlay {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.6);
			opacity: 0;
			visibility: hidden;
			transition: all var(--transition-base);
			z-index: -1;
		}

		.sidebar.open + .overlay {
			opacity: 1;
			visibility: visible;
		}
	}

	@keyframes slideIn {
		from {
			transform: translateX(-100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
