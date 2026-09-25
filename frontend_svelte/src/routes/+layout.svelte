<script lang="ts">
	import '$lib/assets/app.css';
	import { applyTheme, isThemeKey } from '$lib/assets/theme';
	let { children } = $props();

	// 테마 영속: 모든 루트(navless 포함) 커버
	$effect(() => {
		const saved = localStorage.getItem('rewrite_theme');
		applyTheme(isThemeKey(saved) ? saved : 'mono');
	});
</script>

{@render children?.()}
