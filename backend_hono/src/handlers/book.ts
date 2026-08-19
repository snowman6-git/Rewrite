import { Context } from 'hono';
import { readdir } from 'node:fs/promises';
import { BookStruct } from '../types';
import { parse, stringify } from 'smol-toml';
import { v4 as uuidv4 } from 'uuid';
import {
	activebook_listup,
	bookshelf_listup,
	bookshelf_add,
	clone_book,
	read_bookdetail,
} from '../lib/db';

export async function book_listup(c: Context) {
	const bookshelf = await bookshelf_listup();
	// 예외처리와 조건문 만들기
	return c.json(bookshelf);
}

// 나중에 zod로 검증하는 과정을 거쳐야함
export async function book_upload(c: Context) {
	const body = await c.req.parseBody();
	const type = body.type as string;
	const file = body.files as File;

	if (type == 'toml') {
		let path = `./src/test/bookshelf/${file!.name}`;

		// 오류 처리 코드 추가하기
		let saveToml = await Bun.write(path, await file.arrayBuffer());

		const book_toml = parse(await Bun.file(path).text());
		let book = {
			id: book_toml['book'].id,
			title: book_toml['cover'].title,
			desc: book_toml['cover'].desc,
			system: book_toml['prompt'].system,
			starting: book_toml['entry'].starting,
		};
		await bookshelf_add(book);
	}
	return c.json({ message: 'OK', type, files: !!file }, 200);
}

export async function book_unfolds(c: Context) {
	const { book_id, point_id } = await c.req.json();
	const table_id = await clone_book(book_id, point_id);

	// 여기도 나중에 확장 안할거면 단일리턴
	return c.json({
		table_id: table_id,
	});
}

export async function book_detail(c: Context) {
	const { id } = c.req.query();
	return c.json(await read_bookdetail(id));
}

// 나중에 로그인 추가하면, 링크조작으로 접근 방지를 위해 여기랑 엔트리 auth 필수로 전환
export async function library_listup(c: Context) {
	const activebooks = await activebook_listup();
	return c.json(activebooks);
}
