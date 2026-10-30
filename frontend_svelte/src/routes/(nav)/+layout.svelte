<script lang="ts">
	import '$lib/assets/app.css';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Icon from '$components/Common/Icon.svelte';
	import Sheet from '$components/Common/Sheet.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { backEntry } from '$lib/utils/back-entry';
	let { children } = $props();
	const tabs = [
		{ id: 'book', label: '책장', icon: 'books', href: '/book' },
		{ id: 'production', label: '제작', icon: 'edit', href: '/production' },
		{ id: 'library', label: '서재', icon: 'book-open', href: '/library' },
		{ id: 'characters', label: '등장인물', icon: 'users', href: '/characters' },
		{ id: 'settings', label: '설정', icon: 'settings', href: '/settings' }
	];

	let activeTab = $derived(tabs.find((t) => $page.url.pathname.startsWith(t.href))?.id ?? 'book');
	let showProfileCard = $state(false);
	let sidebarOpen = $state(true);

	// 잉크 결제 (가상): 3.8 플래시 = 3.8 × 10^35 원 — 실결제 없는 데모 메뉴 (2026-11-01)
	const INK_AMOUNT_KRW = '380,000,000,000,000,000,000,000,000,000,000,000';
	let inkSheet = $state(false);

	$effect(() => {
		if (!showProfileCard) return;
		function handleDocClick(e: MouseEvent) {
			if (e.target instanceof Element && !e.target.closest('.profile-wrap')) showProfileCard = false;
		}
		function handleKey(e: KeyboardEvent) {
			if (e.key === 'Escape') showProfileCard = false;
		}
			document.addEventListener('mousedown', handleDocClick);
			document.addEventListener('keydown', handleKey);
			return () => {
				document.removeEventListener('mousedown', handleDocClick);
				document.removeEventListener('keydown', handleKey);
			};
	});

	// 뒤로가기 = 프로필카드 닫기 (열림 상태에만 히스토리 entry, 2026-10-27)
	$effect(() => {
		const open = showProfileCard;
		if (!open) return;
		return backEntry(() => (showProfileCard = false));
	});
</script>

<div class="app-layout" class:aside-collapsed={!sidebarOpen}>
	<!-- Header -->
	<header class="app-header">
		<div class="header-content">
			<button class="header-toggle" aria-label="사이드메뉴" onclick={() => (sidebarOpen = !sidebarOpen)}>
				<Icon name="menu" size={20} />
			</button>
			<div class="header-brand">
				<img src="/rewrite-logo.png" alt="Rewrite Logo" class="header-logo" />
				<h1 class="app-title">Rewrite</h1>
			</div>

			<div class="header-actions">
				<button class="header-icon-btn" aria-label="잉크">
					<Icon name="ink" size={18} />
				</button>
				<button class="header-icon-btn" aria-label="알림">
					<Icon name="bell" size={18} />
				</button>
				<div class="profile-wrap">
					<button class="header-avatar" aria-label="프로필" onclick={() => (showProfileCard = !showProfileCard)}>
						<Icon name="user" size={18} />
					</button>
					{#if showProfileCard}
						<div
							class="profile-card"
							in:fly={{ y: -8, duration: 150, easing: cubicOut }}
							out:fly={{ y: -8, duration: 120, easing: cubicOut }}
						>
							<div class="profile-avatar"><Icon name="user" size={32} /></div>
							<p class="profile-name">example</p>
							<p class="profile-sub">example</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<!-- 좌측 사이드메뉴 (PC) -->
	<aside class="app-aside" class:collapsed={!sidebarOpen}>
		{#each tabs as tab (tab.id)}
			<a href={tab.href} class="aside-tab" class:active={activeTab === tab.id}>
				<Icon name={tab.icon} size={18} />
				<span class="aside-tab-label">{tab.label}</span>
			</a>
		{/each}
	</aside>

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
			<button class="nav-item" aria-label="잉크 결제" onclick={() => (inkSheet = true)}>
				<span class="nav-icon"><Icon name="ink" /></span>
				<span class="nav-label">잉크</span>
			</button>
		</div>
	</nav>

	{#if inkSheet}
		<Sheet onClose={() => (inkSheet = false)}>
			<div class="ink-sheet">
				<h2 class="ink-title">잉크 결제</h2>
				<p class="ink-amount">{INK_AMOUNT_KRW}원</p>
				<p class="ink-sub">(3.8 플래시)</p>
				<button
					class="ink-pay-btn"
					onclick={() => {
						inkSheet = false;
						toast.info('가상 결제 — 실제로는 처리되지 않습니다.');
					}}
				>
					결제하기
				</button>
			</div>
		</Sheet>
	{/if}
</div>

<style>
	.app-layout {
		width: 100dvw; /* body가 display:flex(열) + 마운트 div가 display:contents라 flex 항목으로 수축한다 → 폭을 명시 */
		flex: 1;
		min-width: 0;
		height: 100dvh;
		background: transparent; /* body의 원고지 격자를 드러낸다 */
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
		width: 100%;
		height: var(--header-height);
		padding: 0 2rem 0 1rem;
	}

	.header-brand {
		display: flex;
		align-items: center;
		gap: var(--space-2xs);
	}

	.header-actions {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.header-icon-btn {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	@media (hover: hover) {
		.header-icon-btn:hover {
			background: var(--color-bg-tertiary);
			color: var(--color-text-primary);
		}
	}

	.header-avatar {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border-strong);
		border-radius: 50%;
		background: var(--color-bg-elevated);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.profile-wrap {
		position: relative;
	}

	.profile-card {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		width: 200px;
		padding: var(--space-lg);
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		z-index: 200;
	}

	.profile-avatar {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border-strong);
		border-radius: 50%;
		background: var(--color-bg-elevated);
		color: var(--color-text-secondary);
	}

	.profile-name {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
	}

	.profile-sub {
		margin: 0;
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}

	@media (hover: hover) {
		.header-avatar:hover {
			border-color: var(--color-accent-primary);
			color: var(--color-text-primary);
		}
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
		color: var(--color-text-primary);
	}
	.header-toggle {
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	@media (hover: hover) {
		.header-toggle:hover {
			background: var(--color-bg-tertiary);
			color: var(--color-text-primary);
		}
	}

	.app-aside {
		position: fixed;
		top: var(--header-height);
		bottom: 0;
		left: 0;
		width: 200px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--space-md);
		background: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
		overflow-y: auto;
		z-index: 90;
		transition: transform var(--transition-fast);
	}

	.app-aside.collapsed {
		transform: translateX(-100%);
	}

	.aside-tab {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		text-decoration: none;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	@media (hover: hover) {
		.aside-tab:hover {
			background: var(--color-bg-hover);
			color: var(--color-text-primary);
		}
	}

	.aside-tab.active {
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
	}

	@media (min-width: 769px) {
		.app-main {
			padding-left: 200px;
			transition: padding-left var(--transition-fast);
		}

		.app-layout.aside-collapsed .app-main {
			padding-left: 0;
		}

		.app-layout .app-nav {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.app-aside {
			display: none;
		}

		.header-toggle {
			display: none;
		}

		.header-content {
			padding: 0 1rem;
		}
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
		height: 100%;
		margin: 0 auto;
		padding: 0 var(--space-xs);
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		align-self: stretch;
		gap: 2px;
		padding: var(--space-2xs) var(--space-sm);
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		text-decoration: none;
		cursor: pointer;
		transition: all var(--transition-fast);
		border-radius: 0;
		min-width: 60px;
	}

	@media (hover: hover) {
		.nav-item:hover {
			color: var(--color-text-primary);
			background: var(--color-bg-secondary);
		}
	}

	.nav-item.active {
		/* full-fill 배경 → 텍스트+아이콘 gold (엣지투엣지 inset 기기별 편차 회피, 2026-10-27) */
		background: none;
		color: var(--color-accent-primary);
		padding: var(--space-2xs) var(--space-sm);
	}

	.nav-icon {
		font-size: var(--font-size-xl);
	}

	.nav-label {
		font-size: var(--font-size-xs);
	}

	/* ---------- 잉크 결제 시트 (가상, 2026-11-01) ---------- */
	.ink-sheet {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-lg) var(--space-md) var(--space-xl);
	}

	.ink-title {
		margin: 0;
		font-size: var(--font-size-lg);
		color: var(--color-text-primary);
	}

	.ink-amount {
		margin: 0;
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-accent-primary);
		word-break: break-all;
		text-align: center;
	}

	.ink-sub {
		margin: 0;
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}

	.ink-pay-btn {
		margin-top: var(--space-sm);
		padding: var(--space-sm) var(--space-xl);
		border: none;
		border-radius: var(--radius-md);
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
		font-size: var(--font-size-sm);
		font-weight: 600;
		cursor: pointer;
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
