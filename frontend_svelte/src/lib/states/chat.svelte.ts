import type { Msg } from '$lib/types';
import { loadChatHistory } from '$lib/api/chat';
import { apiBase } from '$api/client';
import { modelsState } from './models.svelte';
import { v4 as uuidv4 } from 'uuid';
import { memoryTools } from './memory.svelte';
import { charactersMenu } from './characters.svelte';
import { toast } from '$lib/stores/toast.svelte';
import { deleteMessage, updateMessage } from '$api/message';

// sendMessage가 await할 히스토리 로드 promise. class 바깥 모듈 스코프에 두어
// Svelte LSP의 $state 클래스 필드 제한 문제를 회피한다.
let historyPromise: Promise<void> | null = null;

class ChatState {
	list = $state<Msg[]>([]);
	user_input = $state<string>('');
	logic_plus = $state<boolean>(false);
	book_id = $state<string>('');
	isModelResponding = $state<boolean>(false);
	// 채팅 히스토리 로드 중 플래그. true면 인풋을 닫는다 (book 진입의 loadHistory가 해제)
	historyPending = $state<boolean>(true);
	// 책갈피 점프 요청 pid. MessageList가 $effect로 스크롤하고 정리한다 (스크롤 컨테이너는 거기가 소유)
	jumpPid = $state<string | null>(null);

	// 여기서 관리하면서, 전역에 모델이 응답중인지 전파
	async loadHistory() {
		this.historyPending = true;
		// 히스토리 promise를 모듈 스코프에 보관. sendMessage가 await하도록
		historyPromise = (async () => {
			try {
				this.list = await loadChatHistory(this.book_id);
			} catch {
				this.list = [];
			}
		})().finally(() => {
			this.historyPending = false;
		});
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
		// 스트림이 채우는 자리 — finally가 이 객체만 소비한다 (마지막 항목 스캔은 롤백 후 남의 토큰을 더한다)
		const placeholder: Msg = { pid: uuidv4(), role: 'assistant', content: '', live_token: 0 };
		if (!isReload) {
			this.list = [...this.list, { pid: uuidv4(), role: 'user', content: input }, placeholder];
			this.user_input = ''; // 전송 성공 = 인풋 공백. 실패 시 아래에서 복원
		} else {
			this.list = [...this.list, placeholder];
		}

		// 실패 시 낙관적으로 넣은 항목을 전부 되돌린다 — 재추진은 assistant 1개, 일반 전송은 user+assistant 2개
		const rollback = () => {
			this.isModelResponding = false;
			if (!isReload) this.user_input = input;
			this.list = this.list.slice(0, isReload ? -1 : -2);
		};

		this.isModelResponding = true;
		let sent = false;
		//모델로드중으로 변경
		try {
			if (!modelsState.selectedModel) {
				toast.error('사용할 모델을 먼저 선택하세요.');
				rollback();
				return;
			}
			const response = await fetch(`${apiBase()}/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					book_id: this.book_id,
					chat: input,
					// 프론트에서 ID만 보내고 백에서 조회할지, provider를 같이 보낼지 고민하기
					model: modelsState.selectedModel,
					character_id: charactersMenu.activeId,
					custom_note: '',
					logic_plus: this.logic_plus
				})
			});

			if (response.status !== 200) {
				console.error('[sendMessage] Error response:', response.status, response.statusText);
				// 코드는 그대로 드린다 — 문구 해석(402/429 등)은 프론트가 결정하지 않고 doc/chat_send-atomicity-doc.md §7 의 요구로 남긴다
				toast.error(`메시지 전송에 실패했습니다. (${response.status})`);
				rollback();
				return;
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			if (!reader) {
				toast.error('메시지 전송에 실패했습니다.');
				rollback();
				return;
			}

			let lineBuf = '';
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				try {
					lineBuf += decoder.decode(value, { stream: true });
					const lines = lineBuf.split('\n');
					lineBuf = lines.pop() ?? '';
					for (const streamData of lines) {
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

			if (lineBuf !== '') {
				try {
					const parsed = JSON.parse(lineBuf.trim());
					if (parsed['content'] !== undefined) {
						this.list[this.list.length - 1].content += parsed['content'];
					}
				} catch (e) {
					console.warn('[sendMessage] 종료 후 잔여 라인 파싱 실패:', e);
				}
			}

			this.isModelResponding = false;
			sent = true;
		} catch {
			rollback();
		} finally {
			// 나중에 사이드메뉴에서 커스텀노트, 이미지 URL같이 다른 옵션 추가하기
			if (placeholder.live_token) {
				memoryTools.memory_usage += placeholder.live_token;
			}
		}

		// 전송이 끝난 뒤에만 DB 기준으로 재동기화: 세션 중 만든 pid는 클라이언트 uuid라
		// DELETE /message/delete가 0행을 지운다. 이 재동기화가 있어야 화면에서 즉시 삭제가 된다.
		// 완전 해결은 백엔드가 생성 pid를 스트림으로 돌려주는 것 (doc/chat-usage-doc.md)
		if (sent) {
			await this.loadHistory();
			await historyPromise;
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

	/**
	 * 메시지 수정: 낙관 갱신 후 PATCH /message/update, 실패하면 원문으로 되돌린다.
	 * 백엔드에는 update_page(book_id, pid, content) 가 존재하지만 라우트가 미등록이다
	 * (backend_hono/src/lib/page.ts:8) → 현재는 404로 떨어지고 롤백만 일어난다. 요구는 doc/message-update-doc.md.
	 */
	async editAt(index: number, content: string) {
		const target = this.list[index];
		if (!target) return;
		const original = target.content;
		if (content.trim() === '') {
			toast.error('빈 내용으로 바꿀 수 없습니다.');
			return;
		}
		if (content === original) return;

		this.list[index] = { ...target, content };
		try {
			const res = await updateMessage({ book_id: this.book_id, pid: target.pid, content });
			if (!res.success) throw new Error(res.error ?? '수정 실패');
			toast.success('수정되었습니다.');
		} catch (e) {
			// 화면을 DB 실체에 맞춘다 — 새로고침 시 원문이 살아있으므로 낙관 갱신을 되돌린다
			const i = this.list.findIndex((m) => m.pid === target.pid);
			if (i >= 0) this.list[i] = { ...this.list[i], content: original };
			toast.error(`수정에 실패했습니다. (${e instanceof Error ? e.message : '알 수 없음'})`);
		}
	}

	/**
	 * 멀티삭제: pid별로 DELETE /message/delete 후, DB 기준(`chat_listup`)으로 재동기화.
	 * 세션 중 만든 메시지의 pid는 클라이언트 uuid라 DB pid와 다르고, 백엔드는 0행을 지워도 ok를 준다
	 * → DELETE가 조용히 실패하고 새로고침 시 부활한다. 생성 pid를 돌려주는 계약은 doc/chat-usage-doc.md.
	 * @returns 요청한 pid가 전부 DB에서 사라졌으면 true
	 */
	async deleteMany(pids: string[]): Promise<boolean> {
		if (pids.length === 0) return true;
		const before = await loadChatHistory(this.book_id).catch(() => null);
		await Promise.allSettled(pids.map((pid) => deleteMessage({ book_id: this.book_id, pid })));
		const after = await loadChatHistory(this.book_id).catch(() => null);
		if (before === null || after === null) {
			this.list = this.list.filter((m) => !pids.includes(m.pid));
			toast.error('삭제 결과를 DB에서 확인하지 못했습니다.');
			return false;
		}
		// 화면을 DB 실체에 맞추는 게 핵심 — 백엔드가 ok를 줬다고 리스트만 지우면 새로고침 때 부활한다
		this.list = after;
		const removed = Math.max(0, before.length - after.length);
		if (removed >= pids.length) toast.success(`${removed}건 삭제됨`);
		else if (removed === 0)
			toast.error('삭제되지 않았습니다. (백엔드가 생성 pid를 돌려줘야 완전 삭제됨)');
		else toast.error(`${removed} / ${pids.length}건만 삭제됨`);
		return removed >= pids.length;
	}
}
export const chatState = new ChatState();
