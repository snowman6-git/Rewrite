# Persona API

## Base URL

```
http://localhost:3002/api/personas
```

## Endpoints

### GET /api/personas

페르소나 목록 조회

**Response**:

```json
[
	{
		"id": "string",
		"name": "string",
		"role": "string",
		"order": "number"
	}
]
```

**Example**:

```bash
curl http://localhost:3002/api/personas
```

---

### POST /api/personas

페르소나 추가

**Request Body**:

```json
{
	"name": "string",
	"role": "string"
}
```

**Response**: 추가된 페르소나 객체

**Example**:

```bash
curl -X POST http://localhost:3002/api/personas \
  -H "Content-Type: application/json" \
  -d '{"name": "새 페르소나", "role": "주인공"}'
```

---

### PUT /api/personas/:id

페르소나 수정

**Request Body**:

```json
{
	"name": "string",
	"role": "string",
	"order": "number"
}
```

**Response**: 수정된 페르소나 객체

**Example**:

```bash
curl -X PUT http://localhost:3002/api/personas/123 \
  -H "Content-Type: application/json" \
  -d '{"name": "수정된 이름", "role": "조연", "order": 0}'
```

---

### DELETE /api/personas/:id

페르소나 삭제

**Response**: 성공 메시지

**Example**:

```bash
curl -X DELETE http://localhost:3002/api/personas/123
```

---

### PATCH /api/personas/reorder

순서 변경

**Request Body**:

```json
{
	"orders": ["id1", "id2", "id3"]
}
```

**Response**: 성공 메시지

**Example**:

```bash
curl -X PATCH http://localhost:3002/api/personas/reorder \
  -H "Content-Type: application/json" \
  -d '{"orders": ["id3", "id1", "id2"]}'
```

---

## Error Responses

### 404 Not Found

```json
{
	"error": "Persona not found"
}
```

### 400 Bad Request

```json
{
	"error": "Invalid request body"
}
```
