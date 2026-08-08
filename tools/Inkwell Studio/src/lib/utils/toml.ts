import type { PromptBookState, PromptBookData } from '../types/prompt-book.js';

function escapeTomlString(str: string): string {
	return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`;
}

function escapeMultilineString(str: string): string {
	if (!str || str.trim() === '') {
		return '""';
	}

	const escaped = str.replace(/\\\\/g, '\\\\\\\\').replace(/"""/g, '\\"\\"\\"');
	return `"""\n${escaped}\n"""`;
}

function escapeSystemPrompt(str: string): string {
	if (!str || str.trim() === '') {
		return "''";
	}

	const escaped = str.replace(/'''/g, "\\'\\'\\'");
	return `'''\n${escaped}\n'''`;
}

export function stateToToml(state: PromptBookState): string {
	const lines: string[] = [];

	lines.push('[book]');
	lines.push(`id = ${escapeTomlString(state.bookId)}`);
	lines.push('');

	lines.push('[cover]');
	lines.push(`title = ${escapeTomlString(state.coverTitle)}`);
	lines.push(`desc = ${escapeTomlString(state.coverDesc)}`);
	lines.push('');

	for (let i = 0; i < state.startingPoints.length; i++) {
		const sp = state.startingPoints[i];
		lines.push(`[[entry.starting_point]]`);
		lines.push(`id = ${sp.id}`);
		lines.push(`name = ${escapeTomlString(sp.name)}`);
		lines.push(`content = ${escapeMultilineString(sp.content)}`);
		lines.push('');
	}

	lines.push('[prompt]');
	lines.push(`system = ${escapeSystemPrompt(state.systemPrompt)}`);

	return lines.join('\n');
}

export function tomlToState(tomlContent: string): PromptBookState {
	const state = {
		bookId: '',
		coverTitle: '',
		coverDesc: '',
		startingPoints: [{ id: 1, name: '', content: '' }],
		systemPrompt: ''
	};

	const bookMatch = tomlContent.match(/^\[book\]\s*\n\s*id\s*=\s*"([^"]*)"/m);
	if (bookMatch) {
		state.bookId = bookMatch[1];
	}

	const coverMatch = tomlContent.match(/^\[cover\]\s*\n\s*title\s*=\s*"([^"]*)"/m);
	if (coverMatch) {
		state.coverTitle = coverMatch[1];
	}

	const descMatch = tomlContent.match(/^\s*desc\s*=\s*"([^"]*)"/m);
	if (descMatch) {
		state.coverDesc = descMatch[1];
	}

	const startingPoints: { id: number; name: string; content: string }[] = [];
	const startingPointRegex = /\[\[entry\.starting_point\]\]\s*\n\s*id\s*=\s*(\d+)\s*\n\s*name\s*=\s*"([^"]*)"\s*\n\s*content\s*=\s*"""([\s\S]*?)"""/g;
	let match: RegExpExecArray | null;

	while ((match = startingPointRegex.exec(tomlContent)) !== null) {
		startingPoints.push({
			id: parseInt(match[1], 10),
			name: match[2],
			content: match[3]
		});
	}

	if (startingPoints.length > 0) {
		state.startingPoints = startingPoints;
	}

	const promptMatch = tomlContent.match(/\[prompt\]\s*\n\s*system\s*=\s*'''([\s\S]*?)'''/);
	if (promptMatch) {
		state.systemPrompt = promptMatch[1];
	}

	return state;
}

export function validateState(state: PromptBookState): string[] {
	const errors: string[] = [];

	if (!state.bookId.trim()) {
		errors.push('Book ID는 필수입니다.');
	}

	if (!state.coverTitle.trim()) {
		errors.push('제목은 필수입니다.');
	}

	for (let i = 0; i < state.startingPoints.length; i++) {
		const sp = state.startingPoints[i];
		if (!sp.name.trim()) {
			errors.push(`Starting Point ${i + 1}의 제목은 필수입니다.`);
		}
	}

	return errors;
}

export function downloadToml(state: PromptBookState, filename: string = 'prompt-book.toml'): void {
	const content = stateToToml(state);
	const blob = new Blob([content], { type: 'text/toml;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

export function loadTomlFromFile(file: File): Promise<PromptBookState> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				resolve(tomlToState(content));
			} catch (err) {
				reject(err);
			}
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsText(file);
	});
}