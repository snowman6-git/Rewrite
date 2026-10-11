import { parse, stringify } from 'smol-toml';

/** 시작점 하나 — TOML [[entry.starting]] */
export interface StartingEntry {
	name: string;
	content: string;
}

/** TOML 책 데이터 — 폼에서 채우는 값만 (id는 자동) */
export interface BookTomlData {
	id: string;
	title: string;
	desc: string;
	starting: StartingEntry[];
	system: string;
}

export interface BookTomlIssue {
	field: 'id' | 'title' | 'starting';
	message: string;
}

/** 검증: 빈 필드면 문제 목록, 없으면 빈 배열 */
export function validateBookToml(data: BookTomlData): BookTomlIssue[] {
	const issues: BookTomlIssue[] = [];
	if (!data.id.trim()) issues.push({ field: 'id', message: '책 ID를 입력하세요.' });
	if (!data.title.trim()) issues.push({ field: 'title', message: '책 제목을 입력하세요.' });
	if (!data.starting.some((e) => e.name.trim()))
		issues.push({ field: 'starting', message: '시작점 이름을 하나 이상 입력하세요.' });
	return issues;
}

/** stringify에 들어가는 문서 형식 — smol-toml 키 순서 보존 */
export interface BookTomlDoc {
	book: { id: string };
	cover: { title: string; desc: string };
	entry: { starting: { id: number; name: string; content: string }[] };
	prompt: { system: string };
}

/**
 * 폼 데이터 → Rewrite book_upload 형식의 TOML 문자열.
 * 기준: Rewrite/backend_hono/src/test/bookshelf/empty_book.toml
 * 섹션 순서: [book] → [cover] → [[entry.starting]] → [prompt]
 */
export function buildBookToml(data: BookTomlData): string {
	// 빈 이름 제외 후 1..n 재번호화 — 백엔드 샘플과 동일
	let n = 0;
	const starting = data.starting.flatMap((e) => {
		const name = e.name.trim();
		return name ? [{ id: ++n, name, content: e.content }] : [];
	});
	const doc: BookTomlDoc = {
		book: { id: data.id.trim() },
		cover: { title: data.title.trim(), desc: data.desc.trim() },
		entry: { starting },
		prompt: { system: data.system }
	};
	return stringify(doc);
}

/** 저장 파일명 — id에서 파일명 불가 문자만 제거, 비면 book */
export function tomlFileName(data: BookTomlData): string {
	const base =
		data.id
			.trim()
			.replace(/[\\/:*?"<>|]/g, '')
			.trim() || 'book';
	return `${base}.toml`;
}

/** 불러오기: TOML 텍스트 → 폼 데이터 (파싱 실패면 throw — 호출쪽이 catch) */
export function parseBookToml(text: string): BookTomlData {
	// SAFETY: parse()는 TomlTable을 반환 — 문서가 [book]/[cover]/entry.starting/[prompt] 구조인지
	// 타입으로는 검증 불가. 누락 키는 아래 ?. + ?? 기본값으로 처리하므로 안전.
	const doc = parse(text) as unknown as BookTomlDoc;
	return {
		id: doc.book?.id ?? '',
		title: doc.cover?.title ?? '',
		desc: doc.cover?.desc ?? '',
		starting: doc.entry?.starting?.length
			? doc.entry.starting.map((e) => ({ name: e.name, content: e.content }))
			: [{ name: '', content: '' }],
		system: doc.prompt?.system ?? ''
	};
}
