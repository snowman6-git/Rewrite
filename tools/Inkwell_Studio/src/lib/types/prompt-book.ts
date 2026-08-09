export interface StartingPoint {
	id: number;
	name: string;
	content: string;
}

export interface Book {
	id: string;
}

export interface Cover {
	title: string;
	desc: string;
}

export interface Prompt {
	system: string;
}

export interface PromptBookData {
	book: Book;
	cover: Cover;
	entry: {
		starting: StartingPoint[];
	};
	prompt: Prompt;
}

export interface PromptBookState {
	bookId: string;
	coverTitle: string;
	coverDesc: string;
	startingPoints: StartingPoint[];
	systemPrompt: string;
}

/**
 * 새 책 상태의 기본값.
 * bookId는 값이 비어 있는 상태로만 존재하며, 실제 발급은
 * `stores/promptBook.svelte.ts`의 `generateId()` 호출을 통해 이루어진다.
 */
export const initialState: PromptBookState = {
	bookId: '',
	coverTitle: '',
	coverDesc: '',
	startingPoints: [{ id: 1, name: '', content: '' }],
	systemPrompt: ''
};