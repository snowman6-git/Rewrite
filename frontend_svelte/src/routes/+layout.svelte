<script module lang="ts">
	import { checkHotpatch } from '$lib/hotpatch/loader.svelte';

	// 인앱 핫패치: 부팅 시 1회만 (module = 매 내비게이션이 아닌 번들 로드 1회 실행)
	// Tauri 전용, 실패 시 임베드 폴백, 루프방지 플래그 — doc/hotpatch-doc.md
	void checkHotpatch();
</script>

<script lang="ts">
	import '$lib/assets/app.css';
	import { applyTheme, isThemeKey } from '$lib/assets/theme';
	import { applyScale, readScale } from '$lib/assets/scale';
	import HotpatchSplash from '$components/HotpatchSplash.svelte';
	import ToastContainer from '$components/Common/ToastContainer.svelte';
	let { children } = $props();

	// 테마 영속: 모든 루트(navless 포함) 커버
	$effect(() => {
		const saved = localStorage.getItem('rewrite_theme');
		applyTheme(isThemeKey(saved) ? saved : 'mono');
	});

	// 배율 영속: 테마와 같은 지점 — 설정 화면에 들어오기 전 앱 첫 프레임부터 적용
	$effect(() => {
		applyScale(readScale());
	});
</script>

{@render children?.()}
<HotpatchSplash />
<!-- 토스트는 루트 1곳에서만 마운트: 페이지마다 마운트하면 /settings·/library처럼 빠진 화면에서 피드백이 사라진다 -->
<ToastContainer />
