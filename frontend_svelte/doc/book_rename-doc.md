# book_rename API 요구사항

## 엔드포인트

- Method: `POST`
- Path: `/book_rename`
- Body: `{ "id": string, "title": string }`
- Auth: `withCredentials`

## 동작

`C_Bookspine.title` 갱신. `id` 해석 순서:

1. `C_Bookspine.id == id` → 바로 갱신 (책장 카드는 spine id를 보냄)
2. 아니면 `F_Book.session_id == id` → 해당 `F_Book.id`(spine)로 갱신 (서재 카드는 session_id를 보냄)
3. 둘 다 불일치 → `404`

## 응답

- 성공: `200` `{ "message": "ok" }`
- 없음: `404` `{ "error": "..." }`
- 빈 title: `400`

## 프론트 계약

- `api/book.ts` → `renameBook(id, title)`
- 책장/서재 모두 우클릭(데스크톱) / 롱프레스(모바일) → "제목 변경" → Modal(input) → Enter/확인
- 프론트 구현 완료. 백엔드만 구현하면 끝.
