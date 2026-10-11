// UI 배율 = html 루트 폰트 크기. --space-*/--font-size-*가 전부 rem이고 em·rem이 다 따라온다.
// zoom은 금지: body의 100dvw/100dvh에 곱해져서 뷰포트에 구멍이 난다 (실측 500×780 → body 425×663).
// 루트 폰트 크기는 뷰포트 유닛을 안 건드리면서 rem/em만 스케일한다 (실측: body 500×780 유지).
export const SCALE_BASE = 16;
export const SCALE_MIN = 0.75;
export const SCALE_MAX = 1.25;
export const SCALE_KEY = 'rewrite_scale';

export function clampScale(v: number): number {
	return Math.min(Math.max(v, SCALE_MIN), SCALE_MAX);
}

export function readScale(): number {
	if (typeof window === 'undefined') return 1;
	const n = Number(localStorage.getItem(SCALE_KEY));
	return Number.isFinite(n) && n >= SCALE_MIN && n <= SCALE_MAX ? n : 1;
}

export function applyScale(scale: number) {
	document.documentElement.style.fontSize = `${SCALE_BASE * clampScale(scale)}px`;
}
