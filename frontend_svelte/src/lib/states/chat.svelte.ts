import type { Msg } from '$lib/types';
import { loadChatHistory } from '$lib/api/chat';
import { apiBase } from '$api/client';
import { modelsState } from './models.svelte';
import { v4 as uuidv4 } from 'uuid';
import { memoryTools } from './memory.svelte';
import { toast } from '$lib/stores/toast.svelte';
import { updateMessage } from '$api/message';

// sendMessage가 await할 히스토리 로드 promise. class 바깥 모듈 스코프에 두어
// Svelte LSP의 $state 클래스 필드 제한 문제를 회피한다.
let historyPromise: Promise<void> | null = null;

class ChatState {
	list = $state<Msg[]>([]);
	user_input = $state<string>('');
	logic_plus = $state<boolean>(false);
	book_id = $state<string>('');
	isModelResponding = $state<boolean>(false);

	// 여기서 관리하면서, 전역에 모델이 응답중인지 전파
	async loadHistory() {
		// 히스토리 promise를 모듈 스코프에 보관. sendMessage가 await하도록
		historyPromise = (async () => {
			try {
				this.list = await loadChatHistory(this.book_id);
			} catch {
				this.list = [];
			}
		})();
	}

	async addMessage(newMsg: Msg) {
		this.list = [...this.list, newMsg];
	}

	async initBook_id(book_id: string) {
		this.book_id = book_id;
	}

	// text를 주면 그걸로, 안 주면 입력창 내용을 써서 전송 (재추진은 text 전달)
	async sendMessage(text?: string) {
		const input = (text ?? this.user_input).trim();

		//빈 입력 방지 + 모델이 응답중이면 씹기
		if (input === '' || this.isModelResponding) return;

		//히스토리 로드가 안 끝나면 여기서 멈춤. await 안 하면 loadHistory가 유저 메시지를 덮아 손실됨
		//(히스토리 진입전 전송 방지)
		if (historyPromise) {
			await historyPromise;
		}

		//재추진( text 있음)은 호출쪽에서 이미 슬라이스 처리, here에선 새로 추가하지 않음
		const isReload = text !== undefined;
		if (!isReload) {
			this.list = [...this.list, { pid: uuidv4(), role: 'user', content: input }];
			this.list = [...this.list, { pid: uuidv4(), role: 'assistant', content: '', live_token: 0 }];
			this.user_input = ''; // 전송 성공 = 인풋 공백. 실패 시 아래에서 복원
		} else {
			this.list = [...this.list, { pid: uuidv4(), role: 'assistant', content: '', live_token: 0 }];
		}

		this.isModelResponding = true;
		//모델로드중으로 변경
		const response = await fetch(`${apiBase()}/chat`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				book_id: this.book_id,
				chat: input,
				// 프론트에서 ID만 보내고 백에서 조회할지, provider를 같이 보낼지 고민하기
				model: modelsState.selectedModel,
				custom_note: '',
				logic_plus: this.logic_plus
			})
		});

		try {
			if (response.status !== 200) {
				console.error('[sendMessage] Error response:', response.status, response.statusText);
				toast.error('메시지 전송에 실패했습니다.');
				this.isModelResponding = false;
				if (!isReload) this.user_input = input;
				this.list = this.list.slice(0, -1); // assistant 메시지 제거
				return;
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			if (!reader) {
				toast.error('메시지 전송에 실패했습니다.');
				this.isModelResponding = false;
				if (!isReload) this.user_input = input;
				this.list = this.list.slice(0, -1);
				return;
			}

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

	//재추진: 해당 인덱스(~어시스턴트) 이후 가지를 제거하고, 직전 사용자 메시지로 다시 보내 재생성
	reloadAt(index: number) {
		if (index < 0 || index >= this.list.length) return;
		this.list = this.list.slice(0, index);

		let lastUser: Msg | undefined;
		for (let k = index - 1; k >= 0; k--) {
			if (this.list[k].role === 'user') {
				lastUser = this.list[k];
				break;
			}
		}
		if (!lastUser) {
			toast.error('재추진할 사용자 메시지를 못 찾았습니다.');
			return;
		}
		this.sendMessage(lastUser.content);
	}

	copyAt(index: number) {
		const text = this.list[index]?.content ?? '';
		navigator.clipboard
			.writeText(text)
			.then(() => toast.success('복사되었습니다.'))
			.catch(() => toast.error('복사에 실패했습니다.'));
	}

	deleteAt(index: number) {
		//백엔드에 메시지 삭제 endpoint가 없어 프론트에서만 제거(연동 대기)
		this.list = this.list.slice(0, index).concat(this.list.slice(index + 1));
		toast.warning('삭제: 백엔드 연동 대기');
	}

	//메시지 내용 직접 수정 + 백엔드 DB 저장(수정 버튼용)
	async editMessage(index: number, newContent: string) {
		const msg = this.list[index];
		if (!msg || !newContent.trim()) return;
		//가장 먼저 메모리 반영(즉시 화면에 반영)
		this.list = this.list.map((m, i) => (i === index ? { ...m, content: newContent } : m));
		try {
			const res = await updateMessage({ book_id: this.book_id, pid: msg.pid, content: newContent });
			if (res.success) toast.success('메시지 저장 완료');
			else {
				toast.error('저장에 실패했습니다.');
				//실패시 원래 내용으로 복원
				this.list = this.list.map((m, i) => (i === index ? { ...m, content: msg.content } : m));
			}
		} catch {
			toast.error('저장에 실패했습니다.');
			this.list = this.list.map((m, i) => (i === index ? { ...m, content: msg.content } : m));
		}
	}
}
export const chatState = new ChatState();
