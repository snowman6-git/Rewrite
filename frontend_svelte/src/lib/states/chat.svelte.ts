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
// 진행 중인 /chat 스트림. 백그라운드 정지 시 여기서 끊는다
let streamCtrl: AbortController | null = null;
// 전송 중이라 인풋이 비어 있는 동안의 원문 — hidden에서 초안으로 남긴다
let inflightInput = '';

// 백그라운드 중 프로세스가 죽으면 메모리 인풋은 증발한다 — 책별 초안을 유지한다
const draftKey = (book_id: string) => `rewrite_draft_${book_id}`;
const saveDraft = (book_id: string, text: string) => {
	try {
		if (book_id && text.trim() !== '') localStorage.setItem(draftKey(book_id), text);
		else localStorage.removeItem(draftKey(book_id));
	} catch {
		/* 접근 불가 */
	}
};

if (typeof document !== 'undefined') {
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') {
			// 백그라운드에서 스트림을 방치하면 Android가 네트워크를 멈추고
			// 복귀 시 reader.read()가 TimeoutError로 터진다. 그 사이 isModelResponding이 true로
			// 묶여 인풋이 잠기므로, 여기서 명시적으로 끊는다.
			streamCtrl?.abort();
			// 전송 직후엔 user_input이 비어 있다(롤백은 비동기로 복원) → 인플라이트 원문으로 초안
			saveDraft(chatState.book_id, chatState.user_input || inflightInput);
			return;
		}
		// 복귀: 백엔드는 연결이 끊겨도 스트림을 끝까지 읽고 저장하므로 화면을 DB 실체에 맞춘다
		if (chatState.book_id) chatState.loadHistory();
	});
}

class ChatState {
	list = $state<Msg[]>([]);
	user_input = $state<string>('');
	logic_plus = $state<boolean>(false);
	book_id = $state<string>('');
	isModelResponding = $state<boolean>(false);
	// 채팅 히스토리 로드 중 플래그. true면 인풋을 닫는다 (book 진입의 loadHistory가 해제)
	historyPending = $state<boolean>(true);
	// 인풋 개방 = 히스토리 완료 + 모델 선택. ChatComposer·ChatTools 공유 (2026-10-30 통합)
	ready = $derived<boolean>(this.historyPending === false && !!modelsState.selectedModel);
	// list에 실체를 앉힌 책. book_id와 다르면 화면은 아직 이전 책 행이다 (진입 앵커의 기준)
	loadedBook = $state<string>('');
	// 책갈피 점프 요청 pid. MessageList가 $effect로 스크롤하고 정리한다 (스크롤 컨테이너는 거기가 소유)
	jumpPid = $state<string | null>(null);

	// 여기서 관리하면서, 전역에 모델이 응답중인지 전파
	async loadHistory() {
		this.historyPending = true;
		// 이 요청의 대상 책. 책 이동이 빠르면 chat_listup 응답 도착 순서가 뒤바뀌고
		// 마지막에 도착한 응답이 list를 이긴다 → 대상 책 아닌 응답은 버린다 (화면에 남의 책 행이 뜨는 것 방지)
		const reqBook = this.book_id;
		// 히스토리 promise를 모듈 스코프에 보관. sendMessage가 await하도록
		historyPromise = (async () => {
			try {
				const rows = await loadChatHistory(reqBook);
				if (this.book_id === reqBook) this.list = rows;
			} catch {
				// 실패 시 기존 화면 유지 — 백그라운드 복귀가 네트워크 복구보다 빠르고, list를 비우면 대화가 통째로 사라진다 (2026-10-27 P0-3)
			}
		})().finally(() => {
			if (this.book_id !== reqBook) return; // 낡은 요청이 플래그까지 덮으면 인풋이 열린다
			this.historyPending = false;
			this.loadedBook = this.book_id;
		});
	}

	async addMessage(newMsg: Msg) {
		this.list = [...this.list, newMsg];
	}

	async initBook_id(book_id: string) {
		this.book_id = book_id;
		this.list = []; // 이전 책 행이 새 책 화면에 잠깐이라도 뜨지 않게 (loadHistory가 채운다)
		try {
			this.user_input = localStorage.getItem(draftKey(book_id)) ?? '';
		} catch {
			/* 접근 불가 */
		}
	}

	// text를 주면 그걸로, 안 주면 입력창 내용을 써서 전송 (재추진은 text 전달)
	/**
	 * 스트림 정지: in-flight fetch를 abort. 부분 내용 보존(rollback 아님) —
	 * 백엔드는 클라이언트 끊기 시 Gemini 소비를 멈추고 부분 행을 저장 (2026-11-01).
	 */
	stopStream() {
		streamCtrl?.abort();
	}

	async sendMessage(text?: string): Promise<boolean> {
		const input = (text ?? this.user_input).trim();

		//모델이 응답중이면 씹기. 빈 입력은 허용 — 빈 user 턴은 모델이 이어 쓰게 하는 "계속" 트리거
		// (정확한 계약: 빈 입력 시 user 행 INSERT 생략 — doc/chat-continue-doc.md)
		if (this.isModelResponding) return false;

		//히스토리 로드가 안 끝나면 여기서 멈춤. await 안 하면 loadHistory가 유저 메시지를 덮아 손실됨
		//(히스토리 진입전 전송 방지)
		if (historyPromise) {
			await historyPromise;
		}

		//재추진( text 있음)은 호출쪽에서 이미 슬라이스 처리, here에선 새로 추가하지 않음
		const isReload = text !== undefined;
		// 스트림이 채우는 자리 — finally가 이 객체만 소비한다
		const placeholder: Msg = { pid: uuidv4(), role: 'assistant', content: '', live_token: 0 };
		const userMsg: Msg | null = isReload ? null : { pid: uuidv4(), role: 'user', content: input };
		this.list = [...this.list, ...(userMsg ? [userMsg] : []), placeholder];
		if (!isReload) this.user_input = ''; // 전송 성공 = 인풋 공백. 실패 시 아래에서 복원
		inflightInput = isReload ? '' : input;

		// 낙관 항목은 pid로 지운다. slice(0,-2)는 스트림 중 loadHistory가 list를 교체한 뒤엔
		// 방금 내린 실메시지 2개를 잘라낸다 — 화면에서 "챗 몇개가 씹히는" 현상이 이것
		const addedPids = [userMsg?.pid, placeholder.pid].filter(Boolean) as string[];
		const rollback = () => {
			this.isModelResponding = false;
			if (!isReload) this.user_input = input;
			this.list = this.list.filter((m) => !addedPids.includes(m.pid));
		};

		// 토큰은 placeholder pid로 붙인다 — list가 교체된 뒤엔 마지막 항목이 남의 행이라
		// 거기에 붙이면 그 메시지 내용이 오염된다
		const append = (content: string, live_token?: number) => {
			const i = this.list.findIndex((m) => m.pid === placeholder.pid);
			if (i < 0) return; // list가 교체됐으면 이 스트림은 유령 — 버린다
			this.list[i].content += content;
			if (live_token !== undefined) this.list[i].live_token = live_token;
		};

		this.isModelResponding = true;
		let sent = false;
		//모델로드중으로 변경
		try {
			if (!modelsState.selectedModel) {
				toast.error('사용할 모델을 먼저 선택하세요.');
				rollback();
				return false;
			}
			streamCtrl = new AbortController();
			const response = await fetch(`${apiBase()}/chat`, {
				method: 'POST',
				signal: streamCtrl.signal,
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
				return false;
			}

			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			if (!reader) {
				toast.error('메시지 전송에 실패했습니다.');
				rollback();
				return false;
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
							// content 없는 줄은 usage만 소비 (백엔드가 output-only 줄을 보내면 "undefined"가 버블에 붙는 것 방지)
							if (parsed['content'] !== undefined) append(parsed['content'], output_token);
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
						append(parsed['content']);
					}
				} catch (e) {
					console.warn('[sendMessage] 종료 후 잔여 라인 파싱 실패:', e);
				}
			}

			this.isModelResponding = false;
			sent = true;
		} catch (e) {
			if (e instanceof DOMException && e.name === 'AbortError') {
				// 정지 버튼·백그라운드 전환 abort = 부분 내용을 최종 상태로 남김 — 롤백·재동기화 안 함.
				// 백엔드도 연결 끊기면 부분 저장(2026-11-01)이라 재진입 시 화면·DB 일치.
				this.isModelResponding = false;
				sent = true; // 초안 소멸까지 정상 완료 경로와 동일 처리
			} else {
				// TimeoutError·연결 끊김 등 실오류
				rollback();
				// 백엔드는 클라이언트가 끊겨도 어시스턴트 행을 저장하므로 DB 기준으로 되돌린다.
				await this.loadHistory();
				await historyPromise;
			}
		} finally {
			streamCtrl = null;
			inflightInput = '';
			// 나중에 사이드메뉴에서 커스텀노트, 이미지 URL같이 다른 옵션 추가하기
			if (placeholder.live_token) {
				memoryTools.memory_usage += placeholder.live_token;
			}
		}

		// 전송 성공 시 재동기화하지 않는다: 스트림 토큰이 곧 DB 저장 내용이라 화면은 이미 최종 상태.
		// 재동기화하면 list 교체가 스크롤을 아래로 끌어당긴다 (2026-10-29 제거).
		// 대가: 세션 중 행의 pid는 클라이언트 uuid라 재진입 전까지 최신 2행의 삭제/책갈피는 no-op
		// (백엔드가 생성 pid를 스트림으로 돌려주면 근본 해결 — doc/chat-usage-doc.md §6).
		// 실패(L217)·리롤(L269) 경로만 재동기화 유지.
		if (sent) {
			saveDraft(this.book_id, ''); // 전송 성공 = 초안 소멸
		}
		return sent;
	}

	/**
	 * 리롤: 마지막 어시스턴트 답을 같은 user 문장으로 다시 뽑는다.
	 * 백엔드는 /chat 진입마다 user 행을 INSERT하고 assistant 행을 append만 한다 (endpoint.ts:65,100)
	 * → 구 행을 DB에서 지우지 않으면 문맥에 user 중복과 기각된 답이 쌓인다.
	 * 순서: 재전송 성공 후에만 구 행을 삭제한다. 먼저 지우면 전송 실패 시 user 행이 DB에서 사라진다.
	 * 세션 중 만든 행의 pid는 클라이언트 uuid라 백엔드가 0행을 지운다 → 그 경우 중복으로 남는다
	 * (생성 pid 반환 요구: doc/chat-usage-doc.md §6, 상세: doc/chat-reroll-doc.md).
	 */
	async rerollAt(index: number) {
		if (index < 0 || index >= this.list.length || this.isModelResponding) return;

		let userIdx = -1;
		for (let k = index - 1; k >= 0; k--) {
			if ((this.list[k].sender ?? this.list[k].role) === 'user') {
				userIdx = k;
				break;
			}
		}
		if (userIdx < 0) {
			toast.error('리롤할 사용자 메시지를 못 찾았습니다.');
			return;
		}

		const stalePids = [this.list[index].pid, this.list[userIdx].pid];
		// 기각될 어시스턴트 행만 화면에서 제거 — user 행은 재전송 동안 그대로 보인다
		this.list = this.list.slice(0, index);

		if (!(await this.sendMessage(this.list[userIdx].content))) return; // 실패 시 원문 보존

		await Promise.allSettled(stalePids.map((pid) => deleteMessage({ book_id: this.book_id, pid })));
		await this.loadHistory();
		await historyPromise;
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
