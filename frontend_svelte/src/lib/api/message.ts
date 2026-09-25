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
