# book_delete API 요구사항 [v]

## 엔드포인트

- Method: `DELETE`
- Path: `/book_delete`
- Query: `id` (string) — **session_id** (프론트는 `DeskBook.id` = session_id를 그대로 보냄)
- Auth: `withCredentials` (기존 book API와 동일)

## 동작

transaction 1개로 `id` session_id 기준으로 아래 삭제:

| 테이블     | 조건                                                 |
| ---------- | ---------------------------------------------------- |
| `F_Book`   | `session_id = ?`                                     |
| `G_Pages`  | `session_id = ?`                                     |
| `I_Header` | `session_id = ?`                                     |
| `H_Stage`  | `session_id = ?` (현재 비어있지만 의존 데이터이므로) |

## 응답

- 성공: `200` `{ "message": "ok" }`
- book 없음: `404` `{ "error": "..." }` (에러 메시지는 프론트 토스트로 표시됨)

## 범위 노트

- `C_Bookspine`(책 제목)은 삭제에서 **제외**: 서재 청서(D_Bookshelf)와 공유되는 데이터.
  지우고 싶으면 별도로 얘기.
- 프론트 구현은 완료 (`Section.svelte` → `handleDelete` → `api/book.ts deleteBook`).
  백엔드만 구현하면 끝.
