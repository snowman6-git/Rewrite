import { apiBase } from '$api/client';

export interface MessageDeleteRequest {
	book_id: string;
	pid: string;
}

export interface MessageDeleteResponse {
	success: boolean;
	error?: string;
}

/**
 * 메시지를 백엔드 DB에서 삭제.
 * 백엔드 핸들러가 `c.req.query()`로 읽으므로 URL 쿼리 파라미터로 전송.
 * (프론트 book_id ↔ 백엔드 session_id 매핑)
 */
export async function deleteMessage(req: MessageDeleteRequest): Promise<MessageDeleteResponse> {
	const url = `${apiBase()}/message/delete?session_id=${encodeURIComponent(req.book_id)}&pid=${encodeURIComponent(req.pid)}`;
	const response = await fetch(url, { method: 'DELETE', credentials: 'include' });
	if (!response.ok) {
		return { success: false, error: `HTTP ${response.status}` };
	}
	return { success: true };
}

export interface MessageUpdateRequest {
	book_id: string;
	pid: string;
	content: string;
}

/**
 * 메시지 내용 수정.
 * 백엔드에는 `update_page(book_id, pid, content)` 가 있으나 라우트 미등록 → 현재는 404로 떨어진다.
 * 요구는 doc/message-update-doc.md.
 */
export async function updateMessage(req: MessageUpdateRequest): Promise<MessageDeleteResponse> {
	const response = await fetch(`${apiBase()}/message/update`, {
		method: 'PATCH',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(req)
	});
	if (!response.ok) {
		return { success: false, error: `HTTP ${response.status}` };
	}
	return { success: true };
}
