# 메시지 내용 수정 API 요구사항 (message-update)

> 프론트 전용 문서. 백엔드(`backend_hono`)는 읽기 전용이므로 여기 요구사항을 백엔드 개발자에게 전달하여 구현한다.

## 1. 배경

- 프론트 ChatBubble 하단 행에 **재생성/수정/메뉴** 버튼, 메뉴 dropdown에 **복사/삭제**를 배치 중이다.
- `수정`(Edit)은 메시지 내용을 직접 변경하고 **백엔드 DB에 저장**까지 해야 한다.
- 현재 메시지는 `G_Pages(session_id, pid, role, content)`에 저장되며, `add_page`로 새 행을 넣는 코드만 존재한다. **내용 업데이트(endpoint)가 없어 새로 추가해야 한다.**

## 2. 추가할 endpoint

| 항목              | 값                                                 |
| ----------------- | -------------------------------------------------- |
| Method            | `PATCH` (안 되면 `POST`)                           |
| Path              | `/message/update`                                  |
| Body              | `{ book_id, pid, content }`                        |
| Response(success) | `{ success: true }`                                |
| Response(error)   | `{ success: false, error: string }` (HTTP 400/500) |

- `book_id` = `G_Pages.session_id` (프론트가 보내는 식별자).
- `pid` = 수정할 행의 `G_Pages.pid`.
- `content` = 새 메시지 내용 (텍스트).

## 3. 구현 예상 (백엔드 측)

```
// src/lib/db.ts 에 추가 (add_page 인접)
export async function update_page(book_id: string, pid: string, content: string) {
  await db.prepare(sql`
    UPDATE G_Pages SET content = ? WHERE session_id = ? AND pid = ?
  `).run([content, book_id, pid]);
}
```

```
// src/handlers/endpoint.ts 에 추가
export async function message_update(c: Context) {
  const { book_id, pid, content } = await c.req.json();
  if (!book_id || !pid || content == null) return c.json({ success: false, error: '필수 값 부족' }, 400);
  await update_page(book_id, pid, content);
  return c.json({ success: true });
}

// src/index.ts
app.patch('/message/update', message_update);
```

## 4. 주의사항 (체크필요)

- **스토리 연속성**: 메시지 내용을 수정하면 그 뒤 생성된 후속 응답은 수정된 내용과 어긋날 수 있다.
  - 기본 구현은 "그 메시지의 내용만 DB에 저장". 후속 재생성(cascade)은 후순위로 검토.
  - 필요시 수정 시 `pid` 이후의 페이지를 삭제하고 재생성하는 옵션 추가.
- **권한**: 현재 `chat_listup` 등은 auth 미적용. `message_update`도 기존 규칙과 맞게 `authMiddleware` 적용 여부 결정 (`/api/*`만 방화벽).
- **검증**: 실제 수정 후 `chat_listup`으로 저장 확인 로직 추가 권장.

## 5. 프론트 호출Contract (src/lib/api/message.ts)

```
PATCH {PUBLIC_API_URL}/message/update
body: { book_id, pid, content }   // withCredentials: true
res: { success: boolean }
```
