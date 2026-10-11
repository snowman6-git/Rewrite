<script lang="ts">
	import Icon from './Icon.svelte';
	import Modal from './Modal.svelte';

	interface Props {
		onUploadZip: () => void;
		onUploadToml: () => void;
		onCancel: () => void;
	}

	let { onUploadZip, onUploadToml, onCancel }: Props = $props();
</script>

<!-- 오버레이·시트·타이틀·취소·Esc·스크림은 Modal이 소유 (구 구현은 전부 복제였다) -->
<Modal title="책 업로드" message="업로드할 파일 형식을 선택하세요." cancelText="취소" {onCancel}>
	<div class="upload-options">
		<button class="option-btn" onclick={onUploadZip}>
			<span class="option-icon"><Icon name="archive" size={22} /></span>
			<span class="option-content">
				<span class="option-title">ZIP 파일</span>
				<span class="option-desc">압축 파일로 여러 책 업로드</span>
			</span>
			<span class="option-arrow">›</span>
		</button>

		<button class="option-btn" onclick={onUploadToml}>
			<span class="option-icon"><Icon name="file-text" size={22} /></span>
			<span class="option-content">
				<span class="option-title">TOML 파일</span>
				<span class="option-desc">TOML 형식으로 책 데이터 업로드</span>
			</span>
			<span class="option-arrow">›</span>
		</button>
	</div>
</Modal>

<style>
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
		transition:
			background var(--transition-fast),
			border-color var(--transition-fast);
		text-align: left;
	}

	@media (hover: hover) {
		.option-btn:hover {
			background: var(--color-bg-elevated);
			border-color: var(--color-accent-primary);
		}
	}

	.option-icon {
		flex-shrink: 0;
		color: var(--color-text-tertiary);
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
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
	}

	.option-arrow {
		font-size: var(--font-size-xl);
		color: var(--color-text-tertiary);
		font-weight: 300;
		flex-shrink: 0;
	}
</style>
