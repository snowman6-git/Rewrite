<script lang="ts">
	let { children } = $props();
</script>

<div class="btn-case">{@render children()}</div>

<style>
	.btn-case {
		display: flex;
		gap: var(--space-sm);
	}

	/* 행을 채우는 건 컨테이너의 역할 (Btn에서 빼고 여기로) — Btn의 .btn은 스코프라 :global 필요 */
	.btn-case :global(.btn) {
		flex: 1;
	}
</style>
