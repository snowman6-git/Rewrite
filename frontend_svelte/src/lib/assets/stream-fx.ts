// 채팅 메시지 등장 효과 — fade(기본)·none·pop.
// {#each} 키드 행은 새 요소라 CSS animation이 삽입 시점에 발화 (Svelte transition 대신 CSS로 — 설정값이 바뀔 때 리마운트 없이 class만 교체됨).
export type StreamFx = 'fade' | 'none' | 'pop';
export const STREAM_FX_KEY = 'rewrite_stream_fx';
export const STREAM_FX_LABELS: Record<StreamFx, string> = {
	fade: '페이드 인(기본)',
	none: '효과 없음',
	pop: '튀어오름'
};

// 토큰 단위: 새로 들어온 청크가 markdown으로 정결되는 시간 — 애니메이션 길이와 항상 일치해야 함 (2026-10-29 파도 380ms)
export const STREAM_FX_SETTLE_MS: Record<StreamFx, number> = {
	fade: 200,
	none: 0,
	pop: 380
};

export function readStreamFx(): StreamFx {
	if (typeof window === 'undefined') return 'fade';
	const v = localStorage.getItem(STREAM_FX_KEY);
	return v === 'none' || v === 'pop' ? v : 'fade';
}
