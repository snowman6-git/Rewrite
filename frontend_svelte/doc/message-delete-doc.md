# 메시지 삭제 API 요구사항 (message-delete)

> 프론트 전용 문서. 백엔드(`backend_hono`)는 읽기 전용이므로 여기 요구사항을 백엔드 개발자에게 전달하여 구현한다.

## 1. 배경

- 프론트 ChatBlock 메뉴에 **삭제** 액션 배치를 준비 중.
- 메시지는 `G_Pages(session_id, pid, role, content)`에 저장되며, `add_page`(삽입) 쿼리만 존재. **삭제(DELETE) endpoint가 없어 새로 추가해야 한다.**
- 수정 API(`message-update-doc.md`)와 쌍으로 동작.

## 2. 추가할 endpoint

| 항목              | 값                                                 |
| ----------------- | -------------------------------------------------- |
| Method            | `DELETE` (안 되면 `POST`)                          |
| Path              | `/message/delete`                                  |
| Body              | `{ book_id, pid }`                                 |
| Response(success) | `{ success: true }`                                |
| Response(error)   | `{ success: false, error: string }` (HTTP 400/500) |

- `book_id` = `G_Pages.session_id` (프론트가 보내는 식별자).
- `pid` = 삭제할 행의 `G_Pages.pid`.

## 3. 구현 예상 (백엔드 측)

```
// src/lib/db.ts 에 추가 (add_page 인접)
export async function delete_page(book_id: string, pid: string) {
  await db.prepare(sql`
    DELETE FROM G_Pages WHERE session_id = ? AND pid = ?
  `).run([book_id, pid]);
}
```

```
// src/handlers/endpoint.ts 에 추가
export async function message_delete(c: Context) {
  const { book_id, pid } = await c.req.json();
  if (!book_id || !pid) return c.json({ success: false, error: '필수 값 부족' }, 400);
  await delete_page(book_id, pid);
  return c.json({ success: true });
}

// src/index.ts
app.delete('/message/delete', message_delete);
```

## 4. 주의사항 (체크필요)

- **스토리 연속성**: 유저 메시지 삭제로 인한 그 뒤 어시스턴트 응답의 고아가 기본 범위에서 제외 — "그 행만 삭제"가 기본. 후속 페이지 cascade 삭제는 후순위(수정 문서와 동일 원칙).
- **권한**: `message_update`와 동일한 auth 규칙을 따른다(기존 `chat_listup` 등 auth 미적용 상태 유지).
- **검증**: 삭제 후 `chat_listup`으로 소거 확인 권장.
- **pid 불일치**: 존재하지 않는 pid 삭제 = no-op 성공(에러 아님)으로 권장.

## 5. 프론트 호출 contract (src/lib/api/message.ts)

```
DELETE {apiBase()}/message/delete
body: { book_id, pid }   // withCredentials: true
res: { success: boolean, error?: string }
```

프론트 함수: `deleteMessage(req: MessageDeleteRequest)` — 구현 완료(백엔드 endpoint 대기 중).
