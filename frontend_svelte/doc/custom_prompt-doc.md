# custom_prompt API 요구사항

## 엔드포인트

- `GET /custom_prompt` — body: text/plain (프롬프트 전문). 없으면 404
- `POST /custom_prompt` — body: `{ "prompt": string }` (최대 1000자)

## 동작

- 책은 session_id 기준으로 저장. 현재 세션 식별 방식은 `/world_edit`와 동일하게 정함
- `PROMPT_MAX = 1000`자 초과 시 `400`

## 응답

- 성공: `200` (GET: 텍스트 / POST: `{ "message": "ok" }`)
- 실패: `400` / `404`

## 프론트 계약

- `views/CustomPrompt.svelte` — onMount GET, 저장 버튼 POST
- 프론트 구현 완료. 백엔드만 구현하면 끝.
