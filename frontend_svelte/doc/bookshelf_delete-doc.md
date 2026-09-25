# bookshelf_delete API 요구사항

## 엔드포인트

- Method: `DELETE`
- Path: `/bookshelf_delete`
- Query: `id` (string) — **C_Bookspine.id** (책장 카드의 book.id)
- Auth: `withCredentials`

## 동작

transaction 1개로 `id` 기준:

| 순서 | 테이블        | 조건                            |
| ---- | ------------- | ------------------------------- |
| 1    | `F_Book`      | `id = ?` → 뽑은 session_id 목록 |
| 2    | `G_Pages`     | `session_id IN (위 목록)`       |
| 3    | `I_Header`    | `session_id IN (위 목록)`       |
| 4    | `H_Stage`     | `session_id IN (위 목록)`       |
| 5    | `E_Starting`  | `id = ?`                        |
| 6    | `C_Bookspine` | `id = ?`                        |

`D_Bookshelf`(청서)는 공유 데이터이므로 **삭제 제외**.

## 응답

- 성공: `200` `{ "message": "ok" }`
- 책 없음: `404` `{ "error": "..." }`

## 프론트 계약

- `api/book.ts` → `deleteBookshelf(id)` (기존 `deleteBook`과 동일 패턴)
- 책장 `/book` 우클릭(데스크톱) / 롱프레스(모바일) → 삭제 → Modal 확인 → 호출 → 토스트 + 목록에서 제거
- 프론트 구현 완료. 백엔드만 구현하면 끝.
