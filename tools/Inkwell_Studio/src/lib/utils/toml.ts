import type { PromptBookState } from '../types/prompt-book.js';

/**
 * backend_hono `smol-toml` 파서 및 실제 샘플(`backend_hono/src/test/book/*.toml`)과
 * 반드시 동일한 스키마를 유지해야 한다.
 *
 * [book]
 * id = "uuid"
 *
 * [cover]
 * title = "..."
 * desc = "..."
 *
 * [[entry.starting]]
 * id = 1
 * name = "..."
 * content = """ ... """
 *
 * [prompt]
 * system = ''' ... '''
 */

function escapeTomlString(str: string): string {
	return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`;
}

// content / system 은 백엔드 샘플과 동일하게 값이 비어 있어도 항상 멀티라인 블록을 유지한다.
function escapeMultilineString(str: string, quote: '"""' | "'''"): string {
	const body = str ?? '';
	if (quote === '"""') {
		// TOML 기본(basic) 멀티라인 문자열: 내부의 세 겹 큰따옴표만 이스케이프
		const escaped = body.replace(/"""/g, '\\"\\"\\"');
		return `"""\n${escaped}\n"""`;
	}
	// TOML 리터럴(literal) 멀티라인 문자열: 이스케이프 없음, 내부에 '''가 오면 안전하게 처리만 회피
	const escaped = body.replace(/'''/g, "''\\'");
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

	for (const sp of state.startingPoints) {
		lines.push(`[[entry.starting]]`);
		lines.push(`id = ${sp.id}`);
		lines.push(`name = ${escapeTomlString(sp.name)}`);
		lines.push(`content = ${escapeMultilineString(sp.content, '"""')}`);
		lines.push('');
	}

	lines.push('[prompt]');
	lines.push(`system = ${escapeMultilineString(state.systemPrompt, "'''")}`);

	return lines.join('\n');
}

export function tomlToState(tomlContent: string): PromptBookState {
	const state: PromptBookState = {
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
	const startingPointRegex =
		/\[\[entry\.starting\]\]\s*\n\s*id\s*=\s*(\d+)\s*\n\s*name\s*=\s*"([^"]*)"\s*\n\s*content\s*=\s*"""([\s\S]*?)"""/g;
	let match: RegExpExecArray | null;

	while ((match = startingPointRegex.exec(tomlContent)) !== null) {
		startingPoints.push({
			id: parseInt(match[1], 10),
			name: match[2],
			// 앞뒤의 개행 하나씩(""" 바로 뒤/앞)은 포맷을 위한 것이므로 제거
			content: match[3].replace(/^\n/, '').replace(/\n$/, '')
		});
	}

	if (startingPoints.length > 0) {
		state.startingPoints = startingPoints;
	}

	const promptMatch = tomlContent.match(/\[prompt\]\s*\n\s*system\s*=\s*'''([\s\S]*?)'''/);
	if (promptMatch) {
		state.systemPrompt = promptMatch[1].replace(/^\n/, '').replace(/\n$/, '');
	}

	return state;
}

export function validateState(state: PromptBookState): string[] {
	const errors: string[] = [];

	if (!state.coverTitle.trim()) {
		errors.push('제목은 필수입니다.');
	}

	for (let i = 0; i < state.startingPoints.length; i++) {
		const sp = state.startingPoints[i];
		if (!sp.name.trim()) {
			errors.push(`시작 지점 ${i + 1}의 제목은 필수입니다.`);
		}
	}

	return errors;
}

/** 제목을 기반으로 안전한 파일명을 만든다. 제목이 비어 있으면 기본값 사용. */
export function suggestFilename(state: PromptBookState): string {
	const base = state.coverTitle.trim() || 'prompt-book';
	const safe = base
		.replace(/[\\/:*?"<>|]+/g, '')
		.replace(/\s+/g, '_')
		.slice(0, 60);
	return `${safe || 'prompt-book'}.toml`;
}

export function downloadToml(state: PromptBookState, filename?: string): void {
	const content = stateToToml(state);
	const blob = new Blob([content], { type: 'text/toml;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename ?? suggestFilename(state);
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
