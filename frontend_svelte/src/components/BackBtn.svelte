<script lang="ts">
</script>

<button class="back-btn" onclick={() => window.history.back()} aria-label="뒤로가기">
	<span class="back-icon"></span>
</button>

<style>
	.back-btn {
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

	.back-btn:hover {
		background: var(--color-bg-hover);
	}

	.back-icon {
		width: 1.25rem;
		height: 1.25rem;
		background-image: url('../lib/assets/back.svg');
		background-position: center;
		background-repeat: no-repeat;
		background-size: contain;
		filter: brightness(0) invert(1);
	}
</style>
