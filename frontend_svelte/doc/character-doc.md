# 등장인물(캐릭터) API 요구사항 (character)

> 프론트 전용 문서. 백엔드(`backend_hono`) 소스가 이 세션의 읽기 전용이라, 여기 요구사항을 백엔드 개발 세션에 전달하여 구현한다.

## 1. 배경

- 프론트 등장인물 섹션(`/characters`) 구현 완료: 이름(필수) + 이미지(선택, 복수, **이미지별 이름 필수**) 추가/삭제.
- 현재 저장소는 **프론트 localStorage(`rewrite_personas`, base64 dataUrl)** — 디바이스 로컬에만 남아 DB 동기화 불가.
- 책(`F_Bookshelf`)·메시지(`G_Pages`)와 동일한 계층에 캐릭터 테이블을 추가해야 한다.

## 2. 추가할 endpoint

### 2-1. 목록

| 항목 | 값 |
| --- | --- |
| Method | `GET` |
| Path | `/character` |
| Response | `{ success: true, characters: [{ id, name, images: [{ id, name, url }] }] }` |

- `images[].url` = 백엔드가 서빙하는 상대 URL (예: `/uploads/{char_id}/{img_id}.png`).
- 존재하지 않으면 빈 배열(에러 아님).

### 2-2. 추가

| 항목 | 값 |
| --- | --- |
| Method | `POST` |
| Path | `/character` |
| Body | `{ name: string, setting: string, images: [{ name: string, data: string(base64 dataUrl) }] }` |
| Response(success) | `{ success: true, id: string }` |
| Response(error) | `{ success: false, error: string }` (HTTP 400/500) |

- `images`는 생략/빈 배열 가능(이미지 없는 캐릭터).
- 이미지 저장: `dataUrl` → 디스크 `uploads/{char_id}/`에 확장자 추출해서 저장, DB엔 상대 경로만.
  - **파일명**: `crypto.randomUUID()` — 클라이언트 데이터로 파일명/경로 구성 금지(zip-slip 계열).
- 트랜잭션 권장: 캐릭터 INSERT → 이미지 파일 쓰기 → 이미지 INSERT.

### 2-3. 삭제

| 항목 | 값 |
| --- | --- |
| Method | `DELETE` (안 되면 `POST`) |
| Path | `/character` |
| Body | `{ id }` |
| Response(success) | `{ success: true }` |

- DB 행 삭제 + `uploads/{id}/` 디렉터리 함께 삭제.
- 존재하지 않는 id = no-op 성공(메시지 삭제 문서와 동일 원칙).

## 3. 구현 예상 (백엔드 측)

```ts
// src/lib/db.ts 에 추가
// C_Character(id TEXT PK, name TEXT NOT NULL, setting TEXT NOT NULL DEFAULT '')
// D_CharacterImage(id TEXT PK, char_id TEXT, name TEXT NOT NULL, path TEXT NOT NULL)

export async function add_character(name: string, setting: string, images: { id: string; name: string; path: string }[]) {
  const id = crypto.randomUUID();
  await db.prepare(sql`INSERT INTO C_Character (id, name, setting) VALUES (?, ?, ?)`).run([id, name, setting]);
  for (const img of images) {
    await db.prepare(sql`INSERT INTO D_CharacterImage (id, char_id, name, path) VALUES (?, ?, ?, ?)`)
      .run([img.id, id, img.name, img.path]);
  }
  return id;
}

export async function delete_character(id: string) {
  await db.prepare(sql`DELETE FROM D_CharacterImage WHERE char_id = ?`).run([id]);
  await db.prepare(sql`DELETE FROM C_Character WHERE id = ?`).run([id]);
}
```

```ts
// src/handlers/endpoint.ts 에 추가
export async function character_add(c: Context) {
  const { name, setting = '', images = [] } = await c.req.json();
  if (!name || !String(name).trim()) return c.json({ success: false, error: '이름 필수' }, 400);
  // dataUrl 디코딩 → uploads/{char_id}/ 에 저장, 확장자는 mime에서 추출
  const id = await add_character(String(name).trim(), String(setting).trim(), saved);
  return c.json({ success: true, id });
}

export async function character_delete(c: Context) {
  const { id } = await c.req.json();
  if (!id) return c.json({ success: false, error: 'id 필수' }, 400);
  await delete_character(id);
  return c.json({ success: true });
}
```

## 4. 주의사항

- **권한**: 기존 endpoint들과 동일 — 현재 앱은 auth 미적용 상태(책/메시지 API와 동일). auth 도입 시 일괄 전환.
- **저장 용량**: base64는 본문의 4/3 배 — 요청 body 크기 제한(`bun` 기본) 확인, 필요 시 멀티파트로 전환.
- **경로 안전**: 저장 경로 = 서버가 만든 id만. 클라이언트가 보내는 문자열을 파일 경로에 직접 쓰지 말 것.
- **검증**: 추가 후 `GET /character`로 확인 권장.

## 5. 프론트 호출 contract (실현 예정)

```ts
// src/lib/api/character.ts
GET    {apiBase()}/character        → { success, characters }
POST   {apiBase()}/character        body { name, setting, images: [{ name, data }] }   // withCredentials: true
DELETE {apiBase()}/character        body { id }
```

프론트 전환 지점: `sections/characters/Section.svelte`의 `load()/save()`(localStorage) → 위 API. UI·유효성(이름/이미지명 필수)은 이미 프론트에서 검사済み.
