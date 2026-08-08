<script lang="ts">
	export interface Props {
		title: string;
		message: string;
		onConfirm: () => void;
		onCancel: () => void;
		variant?: 'danger' | 'default';
		confirmText?: string;
		cancelText?: string;
	}

	let {
		title,
		message,
		onConfirm,
		onCancel,
		variant = 'default',
		confirmText = '확인',
		cancelText = '취소'
	}: Props = $props();

	function handleOverlayClick() {
		onCancel();
	}

	function handleModalClick(e: MouseEvent) {
		e.stopPropagation();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onCancel();
		}
	}

	$effect(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

<div class="modal-overlay" onclick={handleOverlayClick}>
	<div class="modal" class:danger={variant === 'danger'} onclick={handleModalClick}>
		<h3 class="modal-title">{title}</h3>
		<p class="modal-text">{message}</p>
		<div class="modal-actions">
			<button class="btn btn-cancel" onclick={onCancel}>{cancelText}</button>
			<button class="btn btn-confirm" class:danger={variant === 'danger'} onclick={onConfirm}>{confirmText}</button>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		backdrop-filter: blur(4px);
		animation: fadeIn 0.15s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		min-width: 320px;
		max-width: calc(100vw - 2rem);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg);
		animation: slideUp 0.2s ease-out;
	}

	.modal.danger {
		border-color: var(--color-error);
	}

	@keyframes slideUp {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.modal-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 var(--space-md);
	}

	.modal-text {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-lg);
		line-height: 1.6;
	}

	.modal-actions {
		display: flex;
		gap: var(--space-sm);
		justify-content: flex-end;
	}

	.btn {
		padding: var(--space-sm) var(--space-lg);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		border: none;
		font-family: inherit;
	}

	.btn-cancel {
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}

	.btn-cancel:hover {
		background: var(--color-bg-elevated);
		color: var(--color-text-primary);
	}

	.btn-confirm {
		background: var(--color-accent-primary);
		color: white;
	}

	.btn-confirm:hover {
		background: var(--color-accent-secondary);
	}

	.btn-confirm.danger {
		background: var(--color-error);
	}

	.btn-confirm.danger:hover {
		background: #dc2626;
	}

	@media (max-width: 480px) {
		.modal {
			min-width: unset;
			width: calc(100vw - 2rem);
			padding: var(--space-lg);
		}

		.modal-actions {
			flex-direction: column-reverse;
		}

		.btn {
			width: 100%;
			text-align: center;
		}
	}
</style>