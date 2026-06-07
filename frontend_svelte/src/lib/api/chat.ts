import axios from 'axios';
import { PUBLIC_API_URL } from '$env/static/public';

export async function loadChatHistory() {
	const loadHistory = await axios.get(`${PUBLIC_API_URL}/chat_listup`, { withCredentials: true });
	const chat_list = loadHistory.data;
	if (chat_list !== '') {
		return chat_list;
	}
}
