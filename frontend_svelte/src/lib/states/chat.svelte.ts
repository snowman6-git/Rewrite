import type { Msg } from '$lib/types';
import { loadChatHistory } from '$lib/api/chat';
import { PUBLIC_API_URL } from '$env/static/public';
import { modelsState } from './models.svelte';
import { v4 as uuidv4 } from 'uuid';
import { memoryTools } from './memory.svelte';
import { toast } from '$lib/stores/toast.svelte';

class ChatState {
	list = $state<Msg[]>([]);
	user_input = $state<string>('');
	logic_plus = $state<boolean>(false);
	book_id = $state<string>('');
	isModelResponding = $state<boolean>(false);

	// 이제 여기서 관리하면서, 전역에 모델이 응답중인지 전파
	async loadHistory() {
		this.list = await loadChatHistory(this.book_id);
	}

	async addMessage(newMsg: Msg) {
		this.list = [...this.list, newMsg];
	}

	async initBook_id(book_id: string) {
		this.book_id = book_id;
	}

	async sendMessage() {
		// 빈 입력 방지 + 모델이 응답 중이면 씹기
		if (this.user_input.trim() === '' || this.isModelResponding) return;

		try {
			this.list = [...this.list, { page_id: uuidv4(), role: 'user', content: this.user_input }];
			this.list = [
				...this.list,
				{ page_id: uuidv4(), role: 'assistant', content: '', live_token: 0 }
			];
			this.isModelResponding = true;

			const tempUserInput = this.user_input;
			this.user_input = '';

			// 모델로드중으로 변경
			const response = await fetch(`${PUBLIC_API_URL}/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					book_id: this.book_id,
					chat: tempUserInput,
					model: modelsState.selectedModel?.id,
					custom_note: '',
					logic_plus: this.logic_plus
				})
			});

			if (response.status !== 200) {
				console.log('[sendMessage] Error response:', response.status, response.statusText);
				toast.error('메시지 전송에 실패했습니다.');
				this.isModelResponding = false;
				this.user_input = tempUserInput;
				this.list = this.list.slice(0, -1); // assistant 메시지 제거
				return;
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			if (!reader) return;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				try {
					for (const streamData of decoder.decode(value, { stream: true }).split('\n')) {
						if (streamData !== '') {
							const parsed = JSON.parse(streamData.trim());
							const output_token = parsed['output'];

							memoryTools.live_memory_usage = output_token;
							this.list[this.list.length - 1].content += parsed['content'];
							this.list[this.list.length - 1].live_token = output_token;
							this.list = [...this.list];
						}
					}
				} catch {
					continue;
				}
			}

			this.isModelResponding = false;
		} catch {
			this.isModelResponding = false;
		} finally {
			// 나중에 사이드메뉴에서 커스텀노트, 이미지 URL같이 다른 옵션 추가하기
			const lastMsg = this.list[this.list.length - 1];
			if (lastMsg?.live_token) {
				memoryTools.memory_usage += lastMsg.live_token;
			}
		}
	}
}

export const chatState = new ChatState();
