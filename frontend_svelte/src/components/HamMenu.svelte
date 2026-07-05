<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	import WorldEdit from './views/WorldEdit.svelte';
	import Persona from './views/Persona.svelte';
	import Memory from './views/Memory.svelte';

	let isHammenu_open = $state(false);
	let menu_now = $state(0);
	let menus = ['메뉴', '월드에딧', '페르소나', '메모리'];

	function handleXClick() {
		if (menu_now === 0) {
			isHammenu_open = false;
		} else {
			menu_now = 0;
		}
	}
</script>

<button
	class="h_button"
	class:active={isHammenu_open}
	onclick={() => (isHammenu_open = !isHammenu_open)}
	aria-label="메뉴"
>
</button>

{#if isHammenu_open}
	<div
		class="overlay"
		role="dialog"
		aria-label="메뉴 닫기"
		tabindex="-1"
		onclick={() => (isHammenu_open = false)}
		onkeydown={(e) => e.key === 'Escape' && (isHammenu_open = false)}
	></div>
	<div class="side_menu" transition:fly={{ x: 100, duration: 250, easing: cubicOut }}>
		<div class="menu_header">
			<span class="menu_title">{menus[menu_now]}</span>
			<button class="x_button" onclick={handleXClick} aria-label="닫기">
				<span class="x_icon"></span>
			</button>
		</div>
		<div class="menu_content">
			{#if menu_now === 1}
				<WorldEdit />
			{:else if menu_now === 2}
				<Persona />
			{:else if menu_now === 3}
				<Memory />
			{:else}
				<div class="menu_list">
					{#each menus as menu, number (menu)}
						{#if number > 0}
							<button
								class="menu_option"
								class:selected={menu_now === number}
								onclick={() => (menu_now = number)}
							>
								{menu}
							</button>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	/* ---------- Trigger Button ---------- */
	.h_button {
		width: 2.5rem;
		height: 2.5rem;
		flex-shrink: 0;
		border: none;
		border-radius: var(--radius-md);
		background: transparent;
		cursor: pointer;
		position: relative;
		transition: background var(--transition-fast);
	}

	.h_button:hover {
		background: var(--color-bg-hover);
	}

	.h_button::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 1.25rem;
		height: 1rem;
		background-image: url('../lib/assets/h_menu.svg');
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
		filter: brightness(0) invert(1);
		transition: filter var(--transition-fast);
	}

	.h_button.active::before {
		filter: brightness(0) invert(0.5) sepia(1) saturate(5) hue-rotate(220deg);
	}

	/* ---------- Overlay ---------- */
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: rgba(0, 0, 0, 0.5);
		z-index: 998;
	}

	/* ---------- Side Menu ---------- */
	.side_menu {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(24rem, 85vw);
		height: 100vh;
		height: 100dvh;
		background: var(--color-bg-secondary);
		border-left: 1px solid var(--color-border);
		z-index: 999;
		display: flex;
		flex-direction: column;
	}

	/* ---------- Header ---------- */
	.menu_header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.menu_title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.x_button {
		width: 2.5rem;
		height: 2.5rem;
		border: none;
		border-radius: var(--radius-md);
		background: transparent;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background var(--transition-fast);
	}

	.x_button:hover {
		background: var(--color-bg-hover);
	}

	.x_icon {
		width: 1.25rem;
		height: 1.25rem;
		background-image: url('../lib/assets/back.svg');
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
		transform: rotate(180deg);
		filter: brightness(0) invert(1);
	}

	/* ---------- Menu Content ---------- */
	.menu_content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-sm);
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100%;
	}

	/* ---------- Menu List (Home) ---------- */
	.menu_list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--space-xs);
	}

	.menu_option {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: none;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-primary);
		font-size: var(--font-size-base);
		text-align: left;
		cursor: pointer;
		transition: all var(--transition-fast);
		font-family: inherit;
	}

	.menu_option:hover {
		background: var(--color-bg-hover);
	}

	.menu_option.selected {
		background: var(--color-accent-glow);
		color: var(--color-accent-primary);
		font-weight: 500;
	}

	/* ---------- Mobile ---------- */
	@media (max-width: 640px) {
		.side_menu {
			width: 100vw;
		}

		.menu_header {
			padding: var(--space-sm) var(--space-md);
		}

		.menu_title {
			font-size: var(--font-size-base);
		}
	}
</style>
