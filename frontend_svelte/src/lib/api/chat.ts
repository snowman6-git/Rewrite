import axios from 'axios';
import type { Msg } from '$lib/types';
import { PUBLIC_API_URL } from '$env/static/public';

export async function loadChatHistory(): Promise<Msg[]> {
	const response = await axios.get<Msg[]>(`${PUBLIC_API_URL}/chat_listup`, {
		withCredentials: true
	});
	return response.data || [];
}
