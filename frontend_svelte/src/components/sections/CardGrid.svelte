<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, items } = $props<{
		title: string;
		items: { id: number; title: string; author: string; category: string; status: string; progress: number }[];
	}>();
</script>

<div class="cards-section">
	<h2 class="section-label">{title}</h2>
	<div class="cards-grid">
		{#each items as item (item.id)}
			<div class="card">
				<div class="card-cover">
					<div class="cover-placeholder-small"></div>
				</div>
				<div class="card-info">
					<h4 class="card-title">{item.title}</h4>
					<p class="card-author">{item.author}</p>
					<span class="category-badge-small">{item.category}</span>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.cards-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
		gap: var(--space-md);
	}

	.card {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-md);
		overflow: hidden;
		transition: all var(--transition-base);
		border: 1px solid var(--color-border);
	}

	.card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-accent-primary);
	}

	.card-cover {
		position: relative;
		width: 100%;
		height: 140px;
		overflow: hidden;
		background: var(--color-bg-elevated);
	}

	.card-info {
		padding: var(--space-sm);
	}

	.card-title {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 2px;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-clamp: 2;
	}

	.card-author {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
		margin-bottom: var(--space-xs);
	}

	.category-badge-small {
		font-size: 0.65rem;
		padding: 2px 6px;
		background: var(--color-bg-elevated);
		border-radius: var(--radius-xs);
		color: var(--color-text-tertiary);
		align-self: flex-start;
	}

	@media (max-width: 1024px) {
		.cards-grid {
			grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		}
	}

	@media (max-width: 768px) {
		.cards-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.card-cover {
			height: 120px;
		}
	}

	@media (max-width: 480px) {
		.cards-grid {
			grid-template-columns: 1fr;
		}

		.card-cover {
			height: 160px;
		}
	}
</style>
