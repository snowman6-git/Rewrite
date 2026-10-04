# book_rename API 요구사항 (v2 — F_Book.title 분리)

> v1(C_Bookspine.title 갱신) 폐기. spine = 책장 라벨, book = 책 제목으로 분리.

## 1. 스키마

```sql
-- F_Book에 title 추가
ALTER TABLE F_Book ADD COLUMN title TEXT;
-- 백필: 현재 spine title로 (기존엔 둘이 동일 문자열)
-- spine이 없는 행은 폴백('제목 없음')
```

- `C_Bookspine.title` = **책장(shelf) 라벨** — rename과 무관해짐
- `F_Book.title` = **책 제목** — rename 대상. UNIQUE 제약 없음(같은 제목 책 여러 권 가능)

## 2. 엔드포인트

- `POST /book_rename`
- Body: `{ "id": string(= F_Book.session_id), "title": string }` — **session_id 하나만 해석** (v1의 spine/session 이중 해석 폐기)
- 동작: `UPDATE F_Book SET title = ? WHERE session_id = ?`
- 응답: 성공 `200 { "message": "ok" }` / 미존재 `404 { "error": "..." }` / 빈 title `400`
- **반드시 return** — 현재 구현 `console.log` 후 반환값 없음 = Hono 500 원인

## 3. 동반 변경 (필수)

- **목록 쿼리 전환**: 서재/책장 목록이 지금은 `Bookspine.title` JOIN — `F_Book.title`로 전환 (spine은 폴백/차순용)
- **업로드 경로**: spine 생성 시 spine.title = F_Book.title = 업로드 타이틀 (초기 동일, 이후 분기)

## 4. 프론트 계약

- `api/book.ts` `renameBook(id, title)` 유지 — 보내는 `id`의 의미만 **session_id로 통일**
  - LibrarySection: `book.bookId ?? book.id` → session_id 확인 필요 (spine id를 보내는 경로 있으면 수정)
  - book/Section: `book.id` (현재 = session_id) ✓
- 프론트 나머지(모달/토스트/로컬 갱신)는 이미 구현済み
