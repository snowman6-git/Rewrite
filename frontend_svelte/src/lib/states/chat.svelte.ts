import type { Msg } from '$lib/types';
import { loadChatHistory } from '$lib/api/chat';
import { PUBLIC_API_URL } from '$env/static/public';
import { modelsState } from './models.svelte';
import { v4 as uuidv4 } from 'uuid';
import { memoryTools } from './memory.svelte';

class ChatState {
	list = $state<Msg[]>([]);
	user_input = $state<string>('');
	logic_plus = $state<boolean>(false);

	// 이제 여기서 관리하면서, 전역에 모델이 응답중인지 전파
	isModelResponding = $state<boolean>(false);

	async loadHistory() {
		try {
			this.list = (await loadChatHistory()) || [];
		} catch (error) {
			console.error(error);
		} finally {
			console.log('채팅 기록 로드 완료:', this.list);
		}
	}

	async addMessage(newMsg: Msg) {
		this.list = [...this.list, newMsg];
	}
	async sendMessage() {
		// 빈 입력 방지 + 모델이 응답 중이면 씹기
		if (this.user_input.trim() === '' || this.isModelResponding) return;
		try {
			this.list = [...this.list, { id: uuidv4(), sender: 'user', content: this.user_input }];
			this.list = [...this.list, { id: uuidv4(), sender: 'assistant', content: '', live_token: 0 }];
			// 모델로드중으로 변경
			this.isModelResponding = true;
			const tempUserInput = this.user_input; // 현재 입력값을 임시 변수에 저장
			this.user_input = ''; // 입력창 초기화

			// 임의의 로딩메세지, 아무래도 랜덤하게 뜨게해서 뭐라도 하고 있음을 티내는게 로딩의 기본.
			this.list[this.list.length - 1].content = '모델 호출중...';
			const response = await fetch(`${PUBLIC_API_URL}/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					chat: tempUserInput,
					model: modelsState.selectedModel?.id,
					// 나중에 사이드메뉴에서 커스텀노트, 이미지 URL같이 다른 옵션 추가하기
					custom_note: '',
					logic_plus: this.logic_plus
				})
			});
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			if (!reader) return;
			// 끝났으니 비워야지
			this.list[this.list.length - 1].content = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				try {
					for (const streamData of decoder.decode(value, { stream: true }).split('\n')) {
						// 빈거 거르기
						if (streamData !== '') {
							const streamData_json = JSON.parse(streamData.trim());
							const input_token = streamData_json['input'];
							const output_token = streamData_json['output'];

							console.log(`라이브누적: ${input_token + output_token}`);
							memoryTools.live_memory_usage = output_token;

							this.list[this.list.length - 1].content += streamData_json['content'];
							this.list[this.list.length - 1].live_token = output_token;
							this.list = [...this.list];
						}
					}
				} catch (e) {
					console.log(e);
					continue;
				}
			}
			// memoryTools.memory_usage += input_token + output_token
			this.isModelResponding = false; // 모델 응답 완료 표시
		} catch (error) {
			console.error('메시지 전송 실패:', error);
		} finally {
			// 모델이 답변을 종료

			// 응답상태 종료
			this.isModelResponding = false;
			// 최종 사용토큰 메모리에 누적
			memoryTools.memory_usage += this.list[this.list.length - 1].live_token!;
			memoryTools.getMemoryUsage();
		}
	}
}
// 하나의 싱글톤 인스턴스를 만들어 수출(export)합니다.
// 이제 어느 컴포넌트에서든 얘를 불러오면 똑같은 데이터 방을 공유합니다.
export const chatState = new ChatState();
