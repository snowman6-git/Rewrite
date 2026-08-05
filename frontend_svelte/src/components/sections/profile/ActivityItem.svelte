<script lang="ts">
	let { action, title, time, icon }: {
		action: string;
		title: string;
		time: string;
		icon?: string;
	} = $props();

	function getActivityIcon(action: string): string {
		switch (action) {
			case '게시물 게시': return '📝';
			case '댓글': return '💬';
			case '좋아요': return '❤️';
			case '프로필 업데이트': return '👤';
			default: return '📌';
		}
	}
</script>

<div class="activity-item">
	<span class="activity-icon">{getActivityIcon(action)}</span>
	<div class="activity-info">
		<span class="activity-action">{action}</span>
		<span class="activity-title">{title}</span>
		<span class="activity-time">{time}</span>
	</div>
</div>

<style>
	.activity-item {
		display: flex;
		gap: var(--space-md);
		padding: var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-secondary);
	}

	.activity-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.activity-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.activity-action {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.activity-title {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.activity-time {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}

	@media (max-width: 480px) {
		.activity-item {
			padding: var(--space-sm);
		}

		.activity-title {
			font-size: var(--font-size-sm);
		}

		.activity-time {
			font-size: var(--font-size-xs);
		}
	}
</style>
