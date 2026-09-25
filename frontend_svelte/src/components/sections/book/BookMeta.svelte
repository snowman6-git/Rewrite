<script lang="ts">
	import Icon from '$components/Common/Icon.svelte';

	let {
		desc = '',
		author = '',
		category = '',
		usageCount = 0,
		createdAt
	}: {
		desc?: string;
		author?: string;
		category?: string;
		usageCount?: number;
		createdAt?: string;
	} = $props();
</script>

<div class="book-details">
	<div class="book-info-section">
		<h4 class="section-label">소개</h4>
		<p class="book-desc">{desc}</p>
	</div>

	<div class="book-meta-section">
		<div class="book-meta-info">
			<span class="meta-tag"><Icon name="user" size={14} /> {author}</span>
			<span class="meta-tag"><Icon name="folder" size={14} /> {category}</span>
			<span class="meta-tag"><Icon name="bar-chart" size={14} /> {usageCount} 회</span>
		</div>
		<p class="book-created">
			<Icon name="calendar" size={14} />
			{createdAt ? new Date(createdAt).toLocaleDateString('ko-KR') : ''}
		</p>
	</div>
</div>

<style>
	.book-details {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.book-info-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.section-label {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.book-desc {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		line-height: 1.8;
		margin: 0;
		padding: var(--space-sm);
		background: var(--color-bg-elevated);
		border-radius: var(--radius-md);
	}

	.book-meta-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding-top: var(--space-sm);
		border-top: 1px solid var(--color-border);
	}

	.book-meta-info {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.meta-tag {
		font-size: 0.75rem;
		padding: var(--space-2xs) var(--space-xs);
		background: var(--color-bg-elevated);
		border-radius: var(--radius-xs);
		color: var(--color-text-secondary);
	}

	.book-created {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
		margin: 0;
	}
</style>
