<script lang="ts">
	export interface Props {
		onUploadZip: () => void;
		onUploadToml: () => void;
		onCancel: () => void;
	}

	let { onUploadZip, onUploadToml, onCancel }: Props = $props();

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
	<div class="modal" onclick={handleModalClick}>
		<h3 class="modal-title">책 업로드</h3>
		<p class="modal-text">업로드할 파일 형식을 선택하세요.</p>

		<div class="upload-options">
			<button class="option-btn" onclick={onUploadZip}>
				<span class="option-icon">📦</span>
				<div class="option-content">
					<span class="option-title">ZIP 파일</span>
					<span class="option-desc">압축 파일로 여러 책 업로드</span>
				</div>
				<span class="option-arrow">›</span>
			</button>

			<button class="option-btn" onclick={onUploadToml}>
				<span class="option-icon">📝</span>
				<div class="option-content">
					<span class="option-title">TOML 파일</span>
					<span class="option-desc">TOML 형식으로 책 데이터 업로드</span>
				</div>
				<span class="option-arrow">›</span>
			</button>
		</div>

		<div class="modal-actions">
			<button class="btn btn-cancel" onclick={onCancel}>취소</button>
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
		box-shadow: var(--shadow-lg);
		animation: slideUp 0.2s ease-out;
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
		margin: 0 0 var(--space-sm);
	}

	.modal-text {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: 0 0 var(--space-lg);
		line-height: 1.6;
	}

	.upload-options {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		margin-bottom: var(--space-lg);
	}

	.option-btn {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		padding: var(--space-md);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		text-align: left;
	}

	.option-btn:hover {
		background: var(--color-bg-elevated);
		border-color: var(--color-accent-primary);
	}

	.option-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.option-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.option-title {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.option-desc {
		font-size: 0.8rem;
		color: var(--color-text-tertiary);
	}

	.option-arrow {
		font-size: 1.5rem;
		color: var(--color-text-tertiary);
		font-weight: 300;
		flex-shrink: 0;
	}

	.modal-actions {
		display: flex;
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

	@media (max-width: 480px) {
		.modal {
			min-width: unset;
			width: calc(100vw - 2rem);
			padding: var(--space-lg);
		}
	}
</style>
