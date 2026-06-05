import type { Msg } from '$lib/types';
import { loadChatHistory } from '$lib/api/chat';
import { PUBLIC_API_URL } from '$env/static/public';
import { modelsState } from './models.svelte';

class ChatState {
    list = $state<Msg[]>([]);
    user_input = $state<string>('');
    logic_plus = $state<boolean>(false);

    // 이제 여기서 관리하면서, 전역에 모델이 응답중인지 전파
    isModelResponding = $state<boolean>(false);

    async loadHistory() {
        try {
            this.list = await loadChatHistory() || [];
        } catch (error) {
            console.error(error);
        } finally {
            console.log("채팅 기록 로드 완료:", this.list);
        }
    }

    async addMessage(newMsg: Msg) {
        this.list = [...this.list, newMsg];
    }
    async sendMessage() {
        // 빈 입력 방지 + 모델이 응답 중이면 씹기
        if (this.user_input.trim() === '' || this.isModelResponding) return; 
        try{
            // 모델로드중으로 변경
            this.isModelResponding = true;
            const response = await fetch(`${PUBLIC_API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: crypto.randomUUID(),
                    chat: this.user_input,
                    model: modelsState.selectedModel?.id,
                    // 나중에 사이드메뉴에서 커스텀노트, 이미지 URL같이 다른 옵션 추가하기
                    custom_note: '',
                    logic_plus: this.logic_plus
                })
            });
            this.user_input = ''; // 입력창 초기화
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) return;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                for (const line of decoder.decode(value)) {
                    try {
                        // 응답정보는 나중에 추가할거면 하고 아님 말고 (EX TPS, Total_Tokens, Start_in)
                        this.list[this.list.length - 1].content += line;
                        this.list = [...this.list];
                    } catch (e) {
                        console.log(e);
                        continue;
                    }
                }
            }
            this.isModelResponding = false; // 모델 응답 완료 표시
        }
        catch(error){
            console.error("메시지 전송 실패:", error);
        } finally {
            this.isModelResponding = false;
        }
    }
}
// 하나의 싱글톤 인스턴스를 만들어 수출(export)합니다. 
// 이제 어느 컴포넌트에서든 얘를 불러오면 똑같은 데이터 방을 공유합니다.
export const chatState = new ChatState();