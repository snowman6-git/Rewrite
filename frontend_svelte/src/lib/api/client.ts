// API base 주소 — 우선순위: 유저 설정(localStorage) > env(PUBLIC_API_URL) > 런타임 파생
// 유저 설정: 설정 페이지에서 저장 ('rewrite_api_base'), 새로고침 시 반영
// 파생: 주소창 호스트 그대로 (localhost:5173 → localhost:3000, <LAN-IP>:5173 → <LAN-IP>:3000)
// Tauri: tauri.localhost / rewrite://(커스텀 스키엠 핫패치) → 로컬 백엔드 127.0.0.1:3000
// SSR(Node)에서는 window가 없음 — API 호출은 전부 클라이언트에서만 발생
// ponytail: 프론트/백엔드 동일 호스트 + 백엔드 포트 3000 고정 전제
const STORAGE_KEY = 'rewrite_api_base';

function isTauriOrigin(): boolean {
	const p = window.location.protocol;
	const h = window.location.hostname;
	return p === 'tauri:' || p === 'rewrite:' || h === 'tauri.localhost' || h === 'rewrite.localhost';
}

function derive(): string {
	if (typeof window === 'undefined') return 'http://localhost:3000';
	if (isTauriOrigin()) return 'http://127.0.0.1:3000';
	return `${window.location.protocol}//${window.location.hostname}:3000`;
}

export function setApiBase(url: string | null) {
	if (url) localStorage.setItem(STORAGE_KEY, url);
	else localStorage.removeItem(STORAGE_KEY);
}

export function apiBase(): string {
	return (
		(typeof window === 'undefined' ? undefined : localStorage.getItem(STORAGE_KEY)) ??
		import.meta.env.PUBLIC_API_URL ??
		derive()
	);
}
