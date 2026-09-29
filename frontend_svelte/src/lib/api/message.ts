import axios from 'axios';
import { apiBase } from '$api/client';

export interface MessageUpdateRequest {
	book_id: string;
	pid: string;
	content: string;
}

export interface MessageUpdateResponse {
	success: boolean;
	error?: string;
}

export interface MessageDeleteRequest {
	book_id: string;
	pid: string;
}

export interface MessageDeleteResponse {
	success: boolean;
	error?: string;
}

/**
 * 메시지 내용을 직접 수정하여 백엔드 DB에 저장.
 * 구현은 backend_hono 측 task로 이격 — doc/message-update-doc.md 참조.
 */
export async function updateMessage(req: MessageUpdateRequest): Promise<MessageUpdateResponse> {
	const response = await axios.patch<MessageUpdateResponse>(`${apiBase()}/message/update`, req, {
		withCredentials: true
	});
	return response.data;
}

/**
 * 메시지를 백엔드 DB에서 삭제.
 * 구현은 backend_hono 측 task로 이격 — doc/message-delete-doc.md 참조.
 */
export async function deleteMessage(req: MessageDeleteRequest): Promise<MessageDeleteResponse> {
	const response = await axios.delete<MessageDeleteResponse>(`${apiBase()}/message/delete`, {
		data: req,
		withCredentials: true
	});
	return response.data;
}
