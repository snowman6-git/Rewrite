<script module lang="ts">
	import { checkHotpatch } from '$lib/hotpatch/loader.svelte';

	// 인앱 핫패치: 부팅 시 1회만 (module = 매 내비게이션이 아닌 번들 로드 1회 실행)
	// Tauri 전용, 실패 시 임베드 폴백, 루프방지 플래그 — doc/hotpatch-doc.md
	void checkHotpatch();
</script>

<script lang="ts">
	import '$lib/assets/app.css';
	import { applyTheme, isThemeKey } from '$lib/assets/theme';
	import HotpatchSplash from '$components/HotpatchSplash.svelte';
	let { children } = $props();

	// 테마 영속: 모든 루트(navless 포함) 커버
	$effect(() => {
		const saved = localStorage.getItem('rewrite_theme');
		applyTheme(isThemeKey(saved) ? saved : 'mono');
	});
</script>

{@render children?.()}
<HotpatchSplash />
