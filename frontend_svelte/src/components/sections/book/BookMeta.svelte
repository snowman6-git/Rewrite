<script lang="ts">
	import Icon from '$components/Common/Icon.svelte';

	let {
		desc = '',
		createdAt
	}: {
		desc?: string;
		createdAt?: string;
	} = $props();
</script>

<div class="book-details">
	<div class="book-info-section">
		<h4 class="section-label">소개</h4>
		<p class="book-desc">{desc}</p>
	</div>

	<div class="book-meta-section">
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
		color: var(--color-text-primary);
		margin: 0;
	}

	.book-desc {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		line-height: 1.8;
		margin: 0;
	}

	.book-meta-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding-top: var(--space-sm);
		border-top: 1px solid var(--color-border);
	}

	.book-created {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		margin: 0;
	}
</style>
