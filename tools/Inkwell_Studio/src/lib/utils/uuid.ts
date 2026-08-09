/**
 * 책 ID 생성 유틸리티
 * - Web Crypto API(`crypto.randomUUID`)만 사용하는 순수 브라우저 표준 구현.
 * - 별도 npm 패키지(uuid 등)에 의존하지 않아 Tauri ↔ 웹 양쪽에서 동일하게 동작한다.
 */
export function generateId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}

	// 구형 WebView 등 randomUUID 미지원 환경을 위한 폴백 (RFC4122 v4 형식)
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
