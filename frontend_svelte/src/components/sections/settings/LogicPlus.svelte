<script lang="ts">
	import { chatState } from '$lib/states/chat.svelte';
</script>

<div class="card">
	<label class="row">
		<span class="row-text">
			<span class="row-label">논리 플러스</span>
			<span class="row-sub">추론 과정 상세화</span>
		</span>
		<span class="toggle-switch">
			<input type="checkbox" bind:checked={chatState.logic_plus} />
			<span class="toggle-slider"></span>
		</span>
	</label>
</div>

<style>
	.card {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		min-height: 2.75rem;
		cursor: pointer;
	}

	.row-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.row-label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.row-sub {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}
</style>
