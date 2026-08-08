<script lang="ts">
	let { isOpen, onClose } = $props();

	function handleBackdropClick() {
		onClose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

{#if isOpen}
	<!-- Backdrop -->
	<div class="menu-backdrop" onclick={handleBackdropClick} onkeydown={handleKeydown}></div>

	<!-- Menu Panel -->
	<div class="menu-panel">
		<div class="menu-header">
			<h2 class="menu-title">메뉴</h2>
			<button class="menu-close" onclick={onClose}>✕</button>
		</div>

		<nav class="menu-nav">
			<a href="/settings" class="menu-item" onclick={onClose}>
				<span class="menu-icon">⚙️</span>
				<span class="menu-label">설정</span>
			</a>
		</nav>
	</div>
{/if}

<style>
	.menu-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 200;
		opacity: 0;
		animation: fadeIn 0.2s ease forwards;
	}

	.menu-panel {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 280px;
		background: var(--color-bg-primary);
		z-index: 201;
		transform: translateX(-100%);
		transition: transform 0.3s ease;
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
	}

	.menu-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-lg);
		border-bottom: 1px solid var(--color-border);
	}

	.menu-title {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
	}

	.menu-close {
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: var(--color-bg-secondary);
		border-radius: var(--radius-full);
		cursor: pointer;
		color: var(--color-text-secondary);
		font-size: 1rem;
		transition: all var(--transition-fast);
	}

	.menu-close:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.menu-nav {
		flex: 1;
		padding: var(--space-md);
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		border: none;
		background: transparent;
		color: var(--color-text-primary);
		text-decoration: none;
		cursor: pointer;
		transition: all var(--transition-fast);
		border-radius: var(--radius-md);
		width: 100%;
		text-align: left;
	}

	.menu-item:hover {
		background: var(--color-bg-secondary);
	}

	.menu-icon {
		font-size: 1.5rem;
	}

	.menu-label {
		font-size: var(--font-size-base);
		font-weight: 500;
	}

	@keyframes fadeIn {
		to {
			opacity: 1;
		}
	}
</style>
