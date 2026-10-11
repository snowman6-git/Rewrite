<script lang="ts">
	import { onMount } from 'svelte';
	interface Props {
		title: string;
		message: string;
		/** 생략하면 확인 버튼 없이 취소만 (children이 확인 역할을 하는 모달용) */
		onConfirm?: (value?: string) => void;
		onCancel: () => void;
		variant?: 'danger' | 'default';
		confirmText?: string;
		cancelText?: string;
		/** 지정하면 input 렌더, onConfirm에 값 전달 */
		inputValue?: string;
		inputPlaceholder?: string;
		/** 확인 버튼 대신 쓰는 본문 (업로드 형식 선택 등) */
		children?: import('svelte').Snippet;
	}

	let {
		title,
		message,
		onConfirm,
		onCancel,
		variant = 'default',
		confirmText = '확인',
		cancelText = '취소',
		inputValue,
		inputPlaceholder = '',
		children
	}: Props = $props();

	let value = $state(inputValue ?? '');
	let inputEl = $state<HTMLInputElement>();

	onMount(() => {
		inputEl?.focus();
	});

	function handleOverlayClick() {
		onCancel();
	}

	function handleConfirm() {
		if (inputValue !== undefined && value.trim() === '') return;
		onConfirm?.(inputValue !== undefined ? value.trim() : undefined);
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

<div class="modal-overlay" role="presentation" onclick={handleOverlayClick}>
	<div
		class="modal"
		role="presentation"
		class:danger={variant === 'danger'}
		onclick={handleModalClick}
	>
		<h3 class="modal-title">{title}</h3>
		{#if message}<p class="modal-text">{message}</p>{/if}
		{#if inputValue !== undefined}
			<input
				class="modal-input"
				type="text"
				bind:value
				bind:this={inputEl}
				placeholder={inputPlaceholder}
				onkeydown={(e) => {
					if (e.key === 'Enter') handleConfirm();
				}}
			/>
		{/if}
		{#if children}
			{@render children()}
		{/if}
		<div class="modal-actions">
			<button class="btn btn-cancel" onclick={onCancel}>{cancelText}</button>
			{#if onConfirm}
				<button class="btn btn-confirm" class:danger={variant === 'danger'} onclick={handleConfirm}
					>{confirmText}</button
				>
			{/if}
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: var(--color-scrim);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		backdrop-filter: blur(4px);
		animation: fadeIn 0.15s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal {
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-lg);
		padding: var(--space-xl);
		min-width: 320px;
		max-width: calc(100vw - 2rem);
		border: 1px solid var(--color-border);
		animation: slideUp 0.2s ease-out;
	}

	.modal.danger {
		border-color: var(--color-error);
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
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

	.modal-input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		font-family: inherit;
		outline: none;
		margin-bottom: var(--space-lg);
		transition: border-color var(--transition-fast);
	}

	.modal-input:focus {
		border-color: var(--color-accent-primary);
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

	@media (hover: hover) {
		.btn-cancel:hover {
			background: var(--color-bg-elevated);
			color: var(--color-text-primary);
		}
	}

	.btn-confirm {
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
	}

	@media (hover: hover) {
		.btn-confirm:hover {
			background: var(--color-accent-secondary);
		}
	}

	.btn-confirm.danger {
		background: var(--color-error);
	}

	@media (hover: hover) {
		.btn-confirm.danger:hover {
			background: var(--color-error);
		}
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
