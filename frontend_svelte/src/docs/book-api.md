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

| Field    | Type   | Required | Description |
| -------- | ------ | -------- | ----------- |
| title    | string | ✅       | 책 제목     |
| author   | string | ❌       | 저자        |
| category | string | ❌       | 카테고리    |

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

| Field    | Type   | Required | Description  |
| -------- | ------ | -------- | ------------ |
| id       | number | ✅       | 수정할 책 ID |
| title    | string | ❌       | 책 제목      |
| author   | string | ❌       | 저자         |
| category | string | ❌       | 카테고리     |

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

| Parameter | Type   | Required | Description  |
| --------- | ------ | -------- | ------------ |
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
	desc: string;
	author: string;
	category: string;
	usageCount: number;
	createdAt: string;
	content?: string;
	starting_point: Array<{
		id: string;
		name: string;
		content: string;
	}>;
}
```

| Field          | Type     | Description                          |
| -------------- | -------- | ------------------------------------ |
| id             | number   | 책 고유 ID                           |
| title          | string   | 책 제목                              |
| desc           | string   | 책 소개                              |
| author         | string   | 저자                                 |
| category       | string   | 카테고리                             |
| usageCount     | number   | 사용 횟수                            |
| createdAt      | string   | 생성일 (ISO 8601)                    |
| content        | string   | 책 내용 (선택)                       |
| starting_point | object[] | 시작 지점 목록 (항상 1 개 이상)       |

**starting_point 객체**

| Field | Type   | Description  |
| ----- | ------ | ------------ |
| id    | string | 지점 고유 ID |
| name  | string | 지점 이름    |

**Response Example**

```json
{
	"id": 1,
	"title": "태초에 언어가 있었다",
	"desc": "언어의 기원에 대한 탐구",
	"author": "한강",
	"category": "소설",
	"usageCount": 45,
	"createdAt": "2024-01-15",
	"content": "전체 책 내용...",
	"starting_point": [
		{ "id": "sp-1", "name": "제 1 장: 시작" },
		{ "id": "sp-2", "name": "제 2 장: 발전" }
	]
}
```

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

| Status Code | Description           |
| ----------- | --------------------- |
| 400         | Bad Request           |
| 401         | Unauthorized          |
| 404         | Not Found             |
| 500         | Internal Server Error |

---

## Notes

- 모든 요청은 `withCredentials: true` 로 인증 쿠키를 포함합니다.
- `createdAt` 은 ISO 8601 형식 (YYYY-MM-DD) 입니다.
- `usageCount` 는 책 사용 횟수를 나타냅니다.
- 카테고리 목록은 프로젝트 설정에 따라 다릅니다.

---

### 5. 파일 업로드

파일을 업로드하여 책을 추가합니다.

**Endpoint**

```
POST /book_upload
```

**Request**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `FormData` with `file` key

| Field | Type | Required | Description                     |
| ----- | ---- | -------- | ------------------------------- |
| file  | File | ✅       | 업로드할 파일 (.zip 또는 .json) |

**Supported Formats**

- `.zip` - ZIP 압축 파일 (준비 중)
- `.toml` - TOML 파일 (배열 형식)

**TOML Format Example**

```toml
[[books]]
title = "책제목"
author = "저자"
category = "카테고리"
content = """
내용 (줄바꿈: 실제 개행 사용)
"""

[[books]]
title = "다른 책"
author = "다른 저자"
category = "다른 카테고리"
content = """
다른 내용
"""
```

**Response Example**

```json
{
	"message": "2 권의 책이 추가되었습니다.",
	"books": [
		{ "id": "uuid-1", "title": "책 1", "author": "저자 1", "category": "소설", "content": "..." },
		{ "id": "uuid-2", "title": "책 2", "author": "저자 2", "category": "기술", "content": "..." }
	]
}
```

**Frontend Usage**

```typescript
import { uploadBookFile } from '$lib/api/book';

// 파일 선택 후 업로드
const input = document.createElement('input');
input.type = 'file';
input.accept = '.zip,.json';
input.onchange = async (e) => {
	const file = (e.target as HTMLInputElement).files?.[0];
	if (file) {
		const result = await uploadBookFile(file);
		console.log(result.message); // "2 권의 책이 추가되었습니다."
	}
};
input.click();
```

---

### 6. ZIP 파일 업로드

ZIP 압축 파일로 여러 책을 한 번에 업로드합니다.

**Endpoint**

```
POST /book_upload_zip
```

**Request**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `FormData` with `file` key

| Field | Type | Required | Description       |
| ----- | ---- | -------- | ----------------- |
| file  | File | ✅       | 업로드할 ZIP 파일 |

**ZIP Format**

```
books.zip
├── book1.json
├── book2.json
└── book3.json
```

또는:

```
books.zip
└── books.json (배열 형식)
```

**Response Example**

```json
{
	"message": "3 권의 책이 추가되었습니다.",
	"count": 3,
	"books": [
		{ "id": "uuid-1", "title": "책 1", "author": "저자 1", "category": "소설", "content": "..." },
		{ "id": "uuid-2", "title": "책 2", "author": "저자 2", "category": "기술", "content": "..." },
		{ "id": "uuid-3", "title": "책 3", "author": "저자 3", "category": "역사", "content": "..." }
	]
}
```

**Frontend Usage**

```typescript
import { uploadZipFile } from '$lib/api/book';

// ZIP 파일 업로드
const result = await uploadZipFile(zipFile);
console.log(result.count); // 3
console.log(result.books); // Book[]
```

---

### 8. TOML 파일 다중 업로드

여러 TOML 파일을 동시에 업로드합니다.

**Endpoint**

```
POST /book_upload_toml
```

**Request**

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `FormData` with `files` key (multiple)

| Field | Type   | Required | Description          |
| ----- | ------ | -------- | -------------------- |
| files | File[] | ✅       | 업로드할 TOML 파일들 |

**TOML Format Example**

```toml
[[books]]
title = "책제목"
author = "저자"
category = "카테고리"
content = """
내용 (줄바꿈: 실제 개행 사용)
"""

[[books]]
title = "다른 책"
author = "다른 저자"
category = "다른 카테고리"
content = """
다른 내용
"""
```

**Response Example**

```json
{
	"message": "2 권의 책이 추가되었습니다.",
	"count": 2,
	"books": [
		{ "id": "uuid-1", "title": "책 1", "author": "저자 1", "category": "소설", "content": "..." },
		{ "id": "uuid-2", "title": "책 2", "author": "저자 2", "category": "기술", "content": "..." }
	]
}
```

**Frontend Usage**

```typescript
import { uploadTomlFiles } from '$lib/api/book';

// 여러 TOML 파일 업로드
const tomlFiles = [file1, file2];
const result = await uploadTomlFiles(tomlFiles);
console.log(result.count); // 2
console.log(result.books); // Book[]
```

---

## Related

- [Chat API](./chat-api.md)
- [Model API](./model-api.md)
