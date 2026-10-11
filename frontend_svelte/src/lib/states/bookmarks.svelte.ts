import { chatState } from './chat.svelte';

export interface Bookmark {
	pid: string;
	// 목록에서 한 줄로 보여줄 앞부분 (전문을 저장하지 않는다 — 본문은 이미 DB에 있다)
	snippet: string;
	at: number;
}

const KEY = 'rewrite_bookmarks';
type Store = Record<string, Bookmark[]>;

function read(): Store {
	if (typeof window === 'undefined') return {};
	try {
		const raw = localStorage.getItem(KEY);
		const parsed = raw ? JSON.parse(raw) : {};
		return parsed && typeof parsed === 'object' ? parsed : {};
	} catch {
		// 손상된 JSON은 빈 저장소로 취급 (저장 자체가 기능이지 기능이 저장에 의존하면 안 된다)
		return {};
	}
}

class BookmarkState {
	// 책별로 묶는다 — 점프는 해당 책의 채팅 화면에서 일어나므로 다른 책의 pid는 무의미하다
	byBook = $state<Store>(read());

	list = $derived.by(() => this.byBook[chatState.book_id] ?? []);

	has(pid: string): boolean {
		return this.list.some((b) => b.pid === pid);
	}

	toggle(pid: string, content: string) {
		const book = chatState.book_id;
		if (!book || !pid) return;
		const current = this.byBook[book] ?? [];
		this.byBook[book] = this.has(pid)
			? current.filter((b) => b.pid !== pid)
			: [{ pid, snippet: content.slice(0, 80), at: Date.now() }, ...current];
		this.save();
	}

	remove(pid: string) {
		const book = chatState.book_id;
		if (!book) return;
		this.byBook[book] = (this.byBook[book] ?? []).filter((b) => b.pid !== pid);
		this.save();
	}

	private save() {
		localStorage.setItem(KEY, JSON.stringify(this.byBook));
	}
}

export const bookmarkState = new BookmarkState();
