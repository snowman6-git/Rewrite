<script lang="ts">
import { fly } from 'svelte/transition';
import { cubicOut } from 'svelte/easing';

import Icon from '$components/Common/Icon.svelte';
import Desc from '$components/Common/Desc.svelte';
import { inkState } from '$lib/states/ink.svelte';
import WorldEdit from './views/WorldEdit.svelte';
import Persona from './views/Persona.svelte';
import Memory from './views/Memory.svelte';
import Tuning from './views/Tuning.svelte';
import CustomPrompt from './views/CustomPrompt.svelte';

let isHammenu_open = $state(false);
let menu_now = $state(0);
let menus = ['메뉴', '월드에딧', '페르소나', '메모리', '커스텀 프롬프트'];
let showInkUsage = $state(false);

function handleXClick() {
if (showInkUsage) {
showInkUsage = false;
} else if (menu_now === 0) {
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
	<Icon name="menu" size={20} />
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
			<span class="menu_title">{showInkUsage ? '잉크 사용 내역' : menus[menu_now]}</span>
			<button class="x_button" onclick={handleXClick} aria-label="닫기">
				<Icon name="chevron-right" size={22} />
			</button>
		</div>
		<div class="menu_content">
			{#if showInkUsage}
				<div class="ink-usage">
					<Desc>잉크 소모 기록. 소모값이 쌓이면 평균과 예상 횟수에 반영된다.</Desc>
					{#if inkState.usage.length === 0}
						<p class="usage-empty">아직 사용 내역이 없습니다</p>
					{:else}
						<div class="usage-list">
							{#each inkState.usage as u (u.label + u.amount)}
								<div class="usage-row">
									<span class="usage-label">{u.label}</span>
									<span class="usage-amount">-{u.amount.toLocaleString()}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{:else if menu_now === 1}
				<WorldEdit />
			{:else if menu_now === 2}
				<Persona />
			{:else if menu_now === 3}
				<Memory />
			{:else if menu_now === 4}
				<CustomPrompt />
				{:else}
					<button
						class="ink-row"
						onclick={() => (showInkUsage = true)}
						aria-label="잉크 사용 내역 보기"
					>
						<span class="ink-left">
							<Icon name="ink" size={18} />
							<span class="ink-amount">{inkState.balance.toLocaleString()} / {inkState.costPerUse.toLocaleString()}</span>
						</span>
						<span class="ink-est">
							{inkState.estimatedUses === null ? '∞' : `~${inkState.estimatedUses.toLocaleString()}회`}
						</span>
					</button>
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
				<Tuning />
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
		color: var(--color-text-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			background var(--transition-fast),
			color var(--transition-fast);
	}

	.h_button:hover {
		background: var(--color-bg-hover);
	}

	.h_button.active {
		color: var(--color-accent-primary);
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
		padding: var(--space-md) var(--space-sm) var(--space-md) var(--space-lg);
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
		color: var(--color-text-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background var(--transition-fast);
	}

	.x_button:hover {
		background: var(--color-bg-hover);
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

	/* ---------- Ink (home) ---------- */
	.ink-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		margin: var(--space-xs) var(--space-xs) 0;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-secondary);
		font-family: inherit;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition: all var(--transition-fast);
		width: calc(100% - 2 * var(--space-xs));
		box-sizing: border-box;
	}

	.ink-row:hover {
		background: var(--color-bg-hover);
	}

	.ink-left {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		min-width: 0;
	}

	.ink-amount {
		font-size: var(--font-size-sm);
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ink-est {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		white-space: nowrap;
	}

	/* ---------- Ink Usage View ---------- */
	.ink-usage {
		height: 100%;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-xs);
	}

	.usage-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.usage-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-xs) var(--space-sm);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
	}

	.usage-amount {
		color: var(--color-text-tertiary);
		font-variant-numeric: tabular-nums;
	}

	.usage-empty {
		text-align: center;
		color: var(--color-text-tertiary);
		font-size: var(--font-size-sm);
		padding: var(--space-xl) 0;
		margin: 0;
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
			padding: var(--space-sm) var(--space-xs) var(--space-sm) var(--space-md);
		}

		.menu_title {
			font-size: var(--font-size-base);
		}
	}
</style>
