import axios from 'axios';
import type { Msg } from '$lib/types';
import { PUBLIC_API_URL } from '$env/static/public';

export async function loadChatHistory(book_id: string): Promise<Msg[]> {
	const response = await axios.get(`${PUBLIC_API_URL}/chat_listup?book_id=${book_id}`, {
		withCredentials: true
	});
	const data = response.data;
	// 백엔드가 { chat: [...] } 객체로 반환하는 경우와 배열 반환을 모두 처리
	if (Array.isArray(data)) return data as Msg[];
	if (data && Array.isArray(data.chat)) return data.chat as Msg[];
	return [];
}
