<script lang="ts">
	import { goto } from '$app/navigation';

	// SPA 모드: 클라이언트 사이드에서만 네비게이션
	$effect(() => {
		goto('/book');
	});
</script>
