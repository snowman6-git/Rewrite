<script lang="ts">
</script>

<div class="characters-section">
	<!-- Blank Placeholder -->
	<div class="blank-placeholder">
		<p>등장인물 섹션 - 디자인 대기 중</p>
	</div>
</div>

<style>
	.characters-section {
		padding: var(--space-lg);
		max-width: 1400px;
		margin: 0 auto;
	}

	.blank-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 300px;
		color: var(--color-text-secondary);
		font-size: var(--font-size-base);
	}

	@media (max-width: 768px) {
		.characters-section {
			padding: var(--space-md);
		}

		.blank-placeholder {
			min-height: 200px;
			font-size: var(--font-size-sm);
		}
	}

	@media (max-width: 480px) {
		.characters-section {
			padding: var(--space-sm);
		}

		.blank-placeholder {
			min-height: 150px;
			font-size: var(--font-size-xs);
		}
	}
</style>
