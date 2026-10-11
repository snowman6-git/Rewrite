import { describe, it, expect } from 'vitest';
import {
	buildBookToml,
	parseBookToml,
	validateBookToml,
	tomlFileName,
	type BookTomlData
} from './book';

const base: BookTomlData = {
	id: 'example-id',
	title: 'example',
	desc: 'example',
	starting: [{ name: 'example', content: 'example' }],
	system: 'example'
};

describe('validateBookToml', () => {
	it('빈 필드를 필드별로 보고한다', () => {
		const issues = validateBookToml({
			...base,
			id: ' ',
			title: '',
			starting: [{ name: '  ', content: 'x' }]
		});
		expect(issues.map((i) => i.field)).toEqual(['id', 'title', 'starting']);
	});
	it('정상 입력은 문제가 없다', () => {
		expect(validateBookToml(base)).toEqual([]);
	});
});

describe('buildBookToml', () => {
	it('빈 시작점을 버리고 1..n으로 재번호화한다', () => {
		const toml = buildBookToml({
			...base,
			starting: [
				{ name: '', content: 'a' },
				{ name: 'example2', content: 'b' },
				{ name: 'example3', content: '' }
			]
		});
		const doc = parseBookToml(toml);
		expect(doc.starting.map((e) => e.name)).toEqual(['example2', 'example3']);
	});
	it('빌드→파싱 왕복이 필드를 보존한다', () => {
		const data: BookTomlData = {
			id: 'example-id',
			title: 'example',
			desc: 'example',
			starting: [
				{ name: 'example', content: 'example' },
				{ name: 'example', content: 'example' }
			],
			system: 'example'
		};
		expect(parseBookToml(buildBookToml(data))).toEqual(data);
	});
});

describe('tomlFileName', () => {
	it('파일명 불가 문자를 제거한다', () => {
		expect(tomlFileName({ ...base, id: 'a/b:c*d?' })).toBe('abcd.toml');
	});
	it('id가 비면 book.toml', () => {
		expect(tomlFileName({ ...base, id: '   ' })).toBe('book.toml');
	});
});

describe('parseBookToml', () => {
	it('키가 누락된 문서도 폼 기본값으로 복원한다', () => {
		expect(parseBookToml('')).toEqual({
			id: '',
			title: '',
			desc: '',
			starting: [{ name: '', content: '' }],
			system: ''
		});
	});
});
