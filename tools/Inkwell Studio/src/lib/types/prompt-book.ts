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
		starting_point: StartingPoint[];
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

export const initialState: PromptBookState = {
	bookId: '',
	coverTitle: '',
	coverDesc: '',
	startingPoints: [{ id: 1, name: '', content: '' }],
	systemPrompt: ''
};