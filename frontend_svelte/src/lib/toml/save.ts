import { buildBookToml, tomlFileName, type BookTomlData } from './book';

/**
 * TOML 저장 — 브라우저 다운로드 (웹 퍼스트, 네이티브 의존 0).
 * 파싱/직렬화 전부 프론트(smol-toml) — 러스트는 AOT 셸만.
 */
export function saveBookToml(data: BookTomlData): void {
	const content = buildBookToml(data);
	const blob = new Blob([content], { type: 'application/toml' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = tomlFileName(data);
	a.click();
	URL.revokeObjectURL(url);
}
