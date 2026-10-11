<script lang="ts">
	import '$lib/assets/app.css';
	import { page } from '$app/stores';
	import Icon from '$components/Common/Icon.svelte';
	let { children } = $props();
	const tabs = [
		{ id: 'book', label: '책장', icon: 'books', href: '/book' },
		{ id: 'production', label: '제작', icon: 'edit', href: '/production' },
		{ id: 'library', label: '서재', icon: 'book-open', href: '/library' },
		{ id: 'characters', label: '등장인물', icon: 'users', href: '/characters' },
		{ id: 'settings', label: '설정', icon: 'settings', href: '/settings' }
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
					<span class="nav-icon"><Icon name={tab.icon} /></span>
					<span class="nav-label">{tab.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>

<style>
	.app-layout {
		width: 100dvw; /* body가 display:flex(열) + 마운트 div가 display:contents라 flex 항목으로 수축한다 → 폭을 명시 */
		flex: 1;
		min-width: 0;
		height: 100dvh;
		background: var(--color-bg-primary);
		display: flex;
		flex-direction: column;
		/* 스크롤은 .app-main 하나가 소유 — 여기서 넘치면 하단 내비 아래 콘텐츠에 도달 못 한다 */
		overflow: hidden;
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
		/* flex 자식의 min-width:auto가 긴 텍스트 때문에 폭을 늘려 수평 스크롤을 만든다 */
		min-width: 0;
		overflow-y: auto;
		padding-top: 3.5rem;
		/* Chrome: flex 스크롤 컨테이너의 padding-bottom은 scrollable overflow에 안 들어온다
		   → 여기서 주면 마지막 행이 fixed nav(4rem) 뒤에 숨는다. 하단 여백은 app.css의 `.app-main > *`가 준다 */
		padding-bottom: 0;
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

	@media (hover: hover) {
		.nav-item:hover {
			color: var(--color-text-primary);
			background: var(--color-bg-secondary);
		}
	}

	.nav-item.active {
		color: var(--color-accent-primary);
	}

	.nav-icon {
		font-size: var(--font-size-xl);
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
			font-size: var(--font-size-lg);
		}

		.nav-label {
			font-size: var(--font-size-xs);
		}
	}
</style>
