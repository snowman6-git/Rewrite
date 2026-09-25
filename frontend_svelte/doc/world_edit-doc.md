# `/world_edit` — 세션 파라미터 추가 (요구사항)

## 프론트에서 보내는 것

- `GET /world_edit?book_id={session_id}`
- `POST /world_edit` — body: `{ "book_id": "{session_id}", "prompt": "..." }`
- `book_id` = `F_Book.session_id` (기존 `/chat`·`/chat_listup`과 동일 값)

## 현재 백엔드 문제

`src/handlers/endpoint.ts`의 `world_edit(c)`:

```ts
let memory = await ReadBook.system(c); // ← book_id 대신 Context 객체 전달
```

- `ReadBook.system(book_id: string)`에 Context가 들어가 `WHERE Header.session_id = ?`가 절대 매칭 안 됨
- 수정: `c.req.query().book_id` (GET) / `c.req.json().book_id` (POST)를 `ReadBook.system()`에 전달
- 추가: 해당 session이 현재 유저 소유인지 검증 (나중에 — 소유 컬럼 DB에 없음, `F_Book`에 user 추가 필요)
