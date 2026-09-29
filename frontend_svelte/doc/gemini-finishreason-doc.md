# Gemini finishReason 가시화 + 안전설정 문서 방식 전환

## 요약 (2026-09-28 실측 근거)

REST 직렬 실측(`gemini-3.8-flash`, 명시적 성 RP 프롬프트):

| safetySettings                      | finishReason | 결과                   |
| ----------------------------------- | ------------ | ---------------------- |
| top-level `BLOCK_NONE` 4개 카테고리 | **STOP**     | 거절 텍스트(모델 자체) |
| top-level `OFF` (현재 코드)         | **STOP**     | 거절 텍스트(동일)      |
| 미설정                              | **STOP**     | 거절 텍스트(동일)      |

**판단**: 필터층(safetySettings)은 이미 무관 — 거절은 모델 정렬(alignment)에서 나옴.
`finishReason`이 `SAFETY`/`PROHIBITED_CONTENT`면 필터 차단, `STOP`이면 모델 자체 거절.
프론트가 이 값을 봐야 "어느 층에서 막힌지" 판별 가능.

## 변경 1 — `src/test/Gemini-api.ts`: threshold `OFF` → `BLOCK_NONE`

문서/SDK 공식 enum(`HarmBlockThreshold`)으로 전환. 효과는 동일하단 실측 확인済み.

```ts
const safetySettings = [
	{ category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
	{ category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
	{ category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
	{ category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
];
```

(`as any` 제거 가능 — SDK 2.21.0의 `SafetySetting.threshold`가 `HarmBlockThreshold` enum 포함)

## 변경 2 — `Gemini_chat`: finishReason + safetyRatings 스트림에 포함

`endpoint.ts`의 gemini 스트림 루프(`for await (const chunk of response)`)에서:

```ts
const fr = chunk.candidates?.[0]?.finishReason; // 'STOP' | 'SAFETY' | 'MAX_TOKENS' | ...
const sr = chunk.candidates?.[0]?.safetyRatings;
if (fr && fr !== 'STOP') console.log('[gemini] finishReason:', fr, sr); // 항상 로그
const res = { content };
if (fr) res.finish_reason = fr; // 매 프레임에 실음 (프론트 미사용 필드, 무해)
```

또는 최소: **루프 종료 후 1회** —

```ts
await add_chat_history(book_id, 'assistant', llm_response_result);
console.log('[gemini] final finishReason:', lastFinishReason); // final line
```

## 변경 3 — (해당 없음) 추론 레벨 = 상시 로우 (유저 확정)

`Gemini_chat`의 `thinkingBudget: 1024` 하드코딩이 **원하는 동작 그 자체** (로우 레벨, logic_plus 토글과 무관).
→ **코드 변경 불필요. 하드코딩 유지.** 핸들러의 `thinking_tokens`는 gemini 경로에서 무시됨(기정사실화).

## 변경 4 — 시스템 프롬프트를 `systemInstruction`으로 (핵심 버그)

**현상**: `.env`의 `SYSTEM_HEADER`(RP 정책 프롬프트)가 안 먹는다는 제보.

**원인 추적 (확정)**:

```
db.ts header():   role: "user", content: SYSTEM_HEADER! + "\n" + db_header.system
Gemini_chat():    role === 'assistant' ? 'model' : 'user'  → system이 user 턴으로 변환
```

.env 프롬프트는 **읽히고 결합도 되지만 user 메시지로 contents에 실림** → Gemini 3.x는 지시로 취급 안 함.

**수정** — `Gemini_chat`에서 system 분리 → `config.systemInstruction`:

```ts
const sys = rewrite_chatlist.find((m) => m.pid === '0'); // header: pid "0", role user, content=SYSTEM_HEADER+book.system
if (sys) rewrite_chatlist = rewrite_chatlist.filter((m) => m !== sys);
const history = rewrite_chatlist.map((msg) => ({
	role: msg.role === 'assistant' ? 'model' : 'user',
	parts: [{ text: String(msg.content) }]
}));
const stream = await ai.models.generateContentStream({
	model: `models/${requestBody.model}`,
	contents: history,
	config: {
		systemInstruction: sys ? sys.content : undefined,
		maxOutputTokens: requestBody.max_tokens,
		thinkingConfig: { thinkingBudget: 1024 },
		safetySettings: safetySettings as any
	}
});
```

주의: `systemInstruction`은 contents와 중복되면 토큰 낭비 — header를 contents에서 **제거**해야 함(위 코드처럼).

## 검증 방법

1. explicit RP 프롬프트 전송 → 응답 JSON 마지막에 `finish_reason: "STOP"` + 거절 텍스트 = 모델 정렬 확인
2. 필터 차단의 경우(향후 정책 변경 시) `finish_reason: "SAFETY"` 로 구분 가능
