// 책(세션) 단위 출력 튜닝 파라미터. 백엔드 연동 전까지 프론트 로컬 상태.
// doc: frontend_svelte/doc/tuning-doc.md (API 연동 시점 작성)
export class TuningState {
	// 추론 깊이 0(없음)~3(높음)
	reasoningDepth = $state(1);
	// 출력 토큰 한도
	maxOutputTokens = $state(4096);
	// 커스텀 프롬프트 (UI에 길이 제한 미적용 — 2026-10-30 PROMPT_MAX 데드코드 제거)
	customPrompt = $state('');
}

export const tuningState = new TuningState();
