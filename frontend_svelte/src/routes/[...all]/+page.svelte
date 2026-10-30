<script lang="ts">
	import { goto } from '$app/navigation';

	// catch-all: 미매칭 경로 전부 홈으로 — 핫패치 부팅 경로(hp{N}/index.html)가 SPA 404로 정지하는 것 차단.
	// WebView마다 history.replaceState 동작이 달라 JS 정규화는 기기에 의존 → 라우터 자체가 잡아받게 (2026-11-01 폰 재현)
	$effect(() => {
		goto('/book');
	});
</script>
