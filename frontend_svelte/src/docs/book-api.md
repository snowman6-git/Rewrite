# 📚 Book API

> 책 (Book) 관리를 위한 RESTful API 입니다.

---

## Overview

이 API 는 사용자의 책을 CRUD operations 으로 관리할 수 있습니다.

- **목록 조회**: 모든 책 또는 검색 필터 적용
- **생성**: 새 책 추가
- **수정**: 책 정보 업데이트
- **삭제**: 책 제거

---

## Base URL

```
${PUBLIC_API_URL}
```

---

## Endpoints

### 1. 책 목록 조회

모든 책 목록을 조회합니다.

**Endpoint**

```
GET /book_listup
```

**Response Example**

```json
{
  "books": [
    {
      "id": 1,
      "title": "태초에 언어가 있었다",
      "author": "한강",
      "category": "소설",
      "usageCount": 45,
      "createdAt": "2024-01-15"
    },
    {
      "id": 2,
      "title": "파친코",
      "author": "이민진",
      "category": "소설",
      "usageCount": 32,
      "createdAt": "2024-02-20"
    }
  ],
  "total": 2
}
```

**Frontend Usage**

```typescript
import { loadBooks } from '$lib/api/book';

// 책 목록 조회
const books = await loadBooks();
console.log(books); // Book[]
```

---

### 2. 책 생성

새 책을 생성합니다.

**Endpoint**

```
POST /book_create
```

**Request Body**

| Field      | Type   | Required | Description      |
|------------|--------|----------|------------------|
| title      | string | ✅       | 책 제목          |
| author     | string | ❌       | 저자             |
| category   | string | ❌       | 카테고리         |

**Request Example**

```json
{
  "title": "사색의 기술",
  "author": "김용규",
  "category": "에세이"
}
```

**Response Example**

```json
{
  "id": 3,
  "title": "사색의 기술",
  "author": "김용규",
  "category": "에세이",
  "usageCount": 0,
  "createdAt": "2024-03-10"
}
```

**Frontend Usage**

```typescript
import { createBook } from '$lib/api/book';

// 새 책 생성
const newBook = await createBook({
  title: '사색의 기술',
  author: '김용규',
  category: '에세이'
});

console.log(newBook); // Book
```

---

### 3. 책 수정

기존 책의 정보를 수정합니다.

**Endpoint**

```
PUT /book_update
```

**Request Body**

| Field      | Type   | Required | Description      |
|------------|--------|----------|------------------|
| id         | number | ✅       | 수정할 책 ID     |
| title      | string | ❌       | 책 제목          |
| author     | string | ❌       | 저자             |
| category   | string | ❌       | 카테고리         |

> 💡 **Note**: `id`만 제공하고 나머지는 생략하면 해당 필드만 수정됩니다.

**Request Example**

```json
{
  "id": 1,
  "title": "태초에 언어가 있었다 (수정)",
  "category": "문학"
}
```

**Response Example**

```json
{
  "id": 1,
  "title": "태초에 언어가 있었다 (수정)",
  "author": "한강",
  "category": "문학",
  "usageCount": 45,
  "createdAt": "2024-01-15"
}
```

**Frontend Usage**

```typescript
import { updateBook } from '$lib/api/book';

// 책 수정
const updatedBook = await updateBook({
  id: 1,
  title: '태초에 언어가 있었다 (수정)',
  category: '문학'
});

console.log(updatedBook); // Book
```

---

### 4. 책 삭제

책을 삭제합니다.

**Endpoint**

```
DELETE /book_delete
```

**Query Parameters**

| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| id        | number | ✅       | 삭제할 책 ID |

**Request Example**

```
DELETE /book_delete?id=1
```

**Response**

```json
{}
```

**Frontend Usage**

```typescript
import { deleteBook } from '$lib/api/book';

// 책 삭제
await deleteBook(1);
```

---

## Types

### Book

```typescript
interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  usageCount: number;
  createdAt: string;
}
```

| Field        | Type   | Description      |
|--------------|--------|------------------|
| id           | number | 책 고유 ID       |
| title        | string | 책 제목          |
| author       | string | 저자             |
| category     | string | 카테고리         |
| usageCount   | number | 사용 횟수        |
| createdAt    | string | 생성일 (ISO 8601)|

---

### BookListResponse

```typescript
interface BookListResponse {
  books: Book[];
  total: number;
}
```

---

### BookCreateRequest

```typescript
interface BookCreateRequest {
  title: string;
  author?: string;
  category?: string;
}
```

---

### BookUpdateRequest

```typescript
interface BookUpdateRequest extends BookCreateRequest {
  id: number;
}
```

---

## Error Handling

모든 에러는 다음과 같은 형태로 반환됩니다.

```json
{
  "error": "에러 메시지"
}
```

**Common Errors**

| Status Code | Description          |
|-------------|----------------------|
| 400         | Bad Request          |
| 401         | Unauthorized         |
| 404         | Not Found            |
| 500         | Internal Server Error|

---

## Notes

- 모든 요청은 `withCredentials: true` 로 인증 쿠키를 포함합니다.
- `createdAt` 은 ISO 8601 형식 (YYYY-MM-DD) 입니다.
- `usageCount` 는 책 사용 횟수를 나타냅니다.
- 카테고리 목록은 프로젝트 설정에 따라 다릅니다.

---

## Related

- [Chat API](./chat-api.md)
- [Model API](./model-api.md)