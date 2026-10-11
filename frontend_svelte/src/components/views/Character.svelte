<script lang="ts">
	import { charactersMenu } from '$lib/states/characters.svelte';
	import Desc from '$components/Common/Desc.svelte';
	import EmptyState from '$components/Common/EmptyState.svelte';
	import Icon from '$components/Common/Icon.svelte';

	type PickCharacter = { id: string; name: string; setting: string };

	// 등장인물 섹션(sections/characters)과 같은 LS 키. 여기는 읽기만 —
	// 쓰기(추가/수정/삭제)는 섹션이 소유.
	const LS = 'rewrite_personas';
	let list = $state<PickCharacter[]>([]);
	$effect(() => {
		try {
			list = (JSON.parse(localStorage.getItem(LS) ?? '[]') as Array<Record<string, unknown>>).map(
				(c) => ({
					id: String(c.id ?? ''),
					name: String(c.name ?? ''),
					setting: String(c.setting ?? '')
				})
			);
		} catch {
			list = [];
		}
	});

	const active = $derived(list.find((c) => c.id === charactersMenu.activeId) ?? null);

	function toggle(id: string) {
		charactersMenu.select(charactersMenu.activeId === id ? '' : id);
	}
</script>

<div class="character-view view-container">
	<Desc>채팅에 등장인물을 지정하면 ID가 요청에 포함된다. 다시 탭하면 해제.</Desc>

	{#if active}
		<div class="active-row" aria-label="현재 선택된 등장인물">
			<Icon name="user" size={16} />
			<span class="active-name">{active.name}</span>
		</div>
	{/if}

	{#if list.length === 0}
		<EmptyState text="등장인물 없음" hint="등장인물 메뉴에서 추가해줘" />
	{:else}
		<div class="char-list">
			{#each list as c (c.id)}
				<button
					class="char-row"
					class:selected={charactersMenu.activeId === c.id}
					onclick={() => toggle(c.id)}
					aria-pressed={charactersMenu.activeId === c.id}
				>
					<span class="char-name">{c.name}</span>
					{#if c.setting}<span class="char-setting">{c.setting}</span>{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.character-view {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.active-row {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-sm);
		border: 1px solid var(--color-accent-primary);
		border-radius: var(--radius-md);
		background: var(--color-accent-glow);
	}

	.active-name {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.char-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.char-row {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--color-text-primary);
		text-align: left;
		cursor: pointer;
		font-family: inherit;
		transition:
			background var(--transition-fast),
			border-color var(--transition-fast);
	}

	@media (hover: hover) {
		.char-row:hover {
			background: var(--color-bg-hover);
		}
	}

	.char-row.selected {
		border-color: var(--color-accent-primary);
		background: var(--color-accent-glow);
	}

	.char-name {
		font-size: var(--font-size-base);
		font-weight: 500;
	}

	.char-setting {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}
</style>
