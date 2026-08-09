import type { PromptBookState, StartingPoint } from '../types/prompt-book.js';
import { generateId } from '../utils/uuid.js';

/**
 * 앱 전역에서 공유하는 "현재 편집 중인 책" 상태.
 *
 * - 홈(편집)과 미리보기 섹션이 동일한 객체를 참조하므로, 화면(라우트)을
 *   이동해도 URL로 상태를 직렬화해 넘길 필요가 없다 (대용량 본문에서 깨지기 쉬움).
 * - localStorage에 자동 저장되어 새로고침/새 창에서도 유지된다.
 * - Tauri 전용 API에 의존하지 않는 순수 Svelte 구현이라 추후 웹 배포로도
 *   그대로 이식 가능하다.
 */

const STORAGE_KEY = 'inkwell-studio:book';

function blankState(): PromptBookState {
	return {
		bookId: generateId(),
		coverTitle: '',
		coverDesc: '',
		startingPoints: [{ id: 1, name: '', content: '' }],
		systemPrompt: ''
	};
}

function normalize(partial: Partial<PromptBookState> | null | undefined): PromptBookState {
	if (!partial) return blankState();
	return {
		bookId: partial.bookId?.trim() || generateId(),
		coverTitle: partial.coverTitle ?? '',
		coverDesc: partial.coverDesc ?? '',
		startingPoints:
			partial.startingPoints && partial.startingPoints.length > 0
				? partial.startingPoints
				: [{ id: 1, name: '', content: '' }],
		systemPrompt: partial.systemPrompt ?? ''
	};
}

function loadInitial(): PromptBookState {
	if (typeof localStorage === 'undefined') return blankState();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return blankState();
		return normalize(JSON.parse(raw) as Partial<PromptBookState>);
	} catch {
		return blankState();
	}
}

/** 반응형 전역 상태. 컴포넌트에서 `book.coverTitle` 처럼 직접 바인딩해서 사용한다. */
export const book: PromptBookState = $state(loadInitial());

/** 현재 상태를 localStorage에 즉시 저장한다. 보통은 `+layout.svelte`의 이펙트가 자동 호출한다. */
export function persistBook(): void {
	if (typeof localStorage === 'undefined') return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
}

function applyState(next: PromptBookState): void {
	book.bookId = next.bookId;
	book.coverTitle = next.coverTitle;
	book.coverDesc = next.coverDesc;
	book.startingPoints = next.startingPoints;
	book.systemPrompt = next.systemPrompt;
	persistBook();
}

/** 완전히 새로운 책을 시작한다 (ID는 uuidv4로 새로 발급). */
export function createNewBook(): void {
	applyState(blankState());
}

/** TOML 파일 등 외부에서 불러온 상태로 교체한다. ID가 없으면 새로 발급한다. */
export function replaceBook(next: Partial<PromptBookState>): void {
	applyState(normalize(next));
}

export function addStartingPoint(): void {
	const nextId =
		book.startingPoints.length > 0 ? Math.max(...book.startingPoints.map((sp) => sp.id)) + 1 : 1;
	book.startingPoints.push({ id: nextId, name: '', content: '' });
}

export function removeStartingPoint(index: number): void {
	if (book.startingPoints.length === 1) return;
	book.startingPoints.splice(index, 1);
}

export function updateStartingPoint(
	index: number,
	field: keyof StartingPoint,
	value: string | number
): void {
	const sp = book.startingPoints[index];
	if (!sp) return;
	(sp[field] as string | number) = value;
}
