<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import type { Toast, ToastType } from '$lib/stores/toast.svelte';
	import { toast } from '$lib/stores/toast.svelte';

	let { toast: toastItem } = $props<{ toast: Toast }>();

	const typeConfig: Record<ToastType, { icon: string; color: string }> = {
		success: { icon: '✓', color: 'var(--color-accent-primary)' },
		error: { icon: '✕', color: '#ef4444' },
		warning: { icon: '⚠', color: '#f59e0b' },
		info: { icon: 'ℹ', color: 'var(--color-accent-secondary)' }
	};

	const config = $derived(typeConfig[toastItem.type as ToastType]);
</script>

<div
	class="toast"
	class:success={toastItem.type === 'success'}
	class:error={toastItem.type === 'error'}
	class:warning={toastItem.type === 'warning'}
	class:info={toastItem.type === 'info'}
	transition:slide={{ duration: 200, easing: cubicInOut }}
>
	<span class="toast-icon" style="color: {config.color}">{config.icon}</span>
	<span class="toast-message">{toastItem.message}</span>
	<button class="toast-close" onclick={() => toast.remove(toastItem.id)} aria-label="닫기">×</button
	>
</div>

<style>
	.toast {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		border-radius: var(--radius-md);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg);
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		min-width: 280px;
		max-width: 400px;
	}

	.toast-icon {
		font-size: 1.25rem;
		font-weight: bold;
		flex-shrink: 0;
	}

	.toast-message {
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.toast-close {
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-tertiary);
		font-size: 1.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all var(--transition-fast);
	}

	.toast-close:hover {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	@media (max-width: 640px) {
		.toast {
			min-width: unset;
			width: calc(100vw - var(--space-lg) * 2);
			max-width: unset;
		}
	}
</style>
