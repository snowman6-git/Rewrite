// 차후 에디터 api로 변경: Rewrite_Deskc
import { Database } from 'bun:sqlite';
import { BookStruct, ReadType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { sql } from './sql';
const db = new Database('main.db');
// db.run("PRAGMA journal_mode = WAL;");

class ReadBook {
	static chat(book_id: string) {
		let chat_list = db
			.prepare(sql`
				SELECT
					Pages.pid,
					Pages.role,
					Pages.content
				FROM
					F_Book AS Book
					JOIN G_Pages AS Pages ON Book.session_id = Pages.session_id
				WHERE
					Pages.session_id = ?
				ORDER BY
					Pages.create_at ASC
				LIMIT
					50 --갯수는 나중에 조절 가능하게 하기
			`)
			.all(book_id);
		return chat_list;
	}
	static header(book_id: string) {
		let header = db
			.prepare(sql`
				SELECT
					Header.system,
					Header.rule
				FROM
					I_Header AS Header
					JOIN F_Book AS Book ON Header.session_id = Book.session_id
				WHERE
					Header.session_id = ?
			`)
			.all(book_id);
		return header;
	}
}

// 일단 평범하게 시스프롬, 스타팅 포인트만 잡고, 나중에 안정화 돼면 시멘틱으로 바꾸자
export async function init() {
	const LibraryBlueprint = db.exec(sql`
		-- DELETE FROM F_Book;
		-- DROP TABLE IF EXISTS G_Pages;
		CREATE TABLE IF NOT EXISTS C_Bookspine (
			id TEXT UNIQUE NOT NULL,
			title TEXT UNIQUE NOT NULL
		);

		CREATE TABLE IF NOT EXISTS D_Bookshelf (
			id TEXT UNIQUE NOT NULL,
			cover BLOB,
			DESC TEXT NOT NULL,
			SYSTEM TEXT NOT NULL
		);

		CREATE TABLE IF NOT EXISTS E_Starting (
			id TEXT NOT NULL,
			point_id TEXT NOT NULL,
			name TEXT NOT NULL,
			content TEXT NOT NULL,
			UNIQUE (id, point_id)
		);

		CREATE TABLE IF NOT EXISTS F_Book (
			id TEXT NOT NULL,
			session_id TEXT NOT NULL,
			create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS G_Pages (
			session_id TEXT NOT NULL,
			pid TEXT NOT NULL,
			role TEXT NOT NULL,
			content TEXT NOT NULL,
			create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);

		CREATE TABLE IF NOT EXISTS H_Stage (
			session_id TEXT NOT NULL,
			c_id TEXT NOT NULL,
			c_name TEXT NOT NULL,
			c_lore TEXT NOT NULL,
			is_npc BOOLEAN DEFAULT FALSE
		);

		CREATE TABLE IF NOT EXISTS I_Header (
			session_id TEXT NOT NULL,
			SYSTEM TEXT NOT NULL,
			rule TEXT
		);

		CREATE TABLE IF NOT EXISTS J_Characters (
			c_id TEXT NOT NULL,
			c_name TEXT NOT NULL,
			c_lore TEXT NOT NULL
		);
	`);
}

// 여유생기면 diff랑 버젼 해싱(혹은 날짜)
// A: idpw, B: userprofile
export async function bookshelf_add(book: BookStruct) {
	// 스타팅도 ID지급 할것, 리스트 형태의 FOR문으로 저장할지 쿼리문 찾을지 찾을것
	// ON CONFLICT(book_id)
	//  여유나면 클래스 형 함수로 만들어서 디비 관련 코드 컴포넌트로 만들기
	// DO UPDATE SET title = excluded.starting;;`,
	db.query(sql`
		INSERT
		OR REPLACE INTO C_Bookspine (id, title)
		VALUES
			(?, ?)
	`).run([book.id, book.title]);

	db.query(sql`
		INSERT
		OR REPLACE INTO D_Bookshelf (id, DESC, SYSTEM)
		VALUES
			(?, ?, ?)
	`).run([book.id, book.desc, book.system]);

	const insertBook = db.prepare(sql`
		INSERT
		OR REPLACE INTO E_Starting (id, point_id, name, content)
		VALUES
			(?, ?, ?, ?);
	`);

	let starting: Array<JSON> = book.starting!;
	const insertBooks = db.transaction((entry) => {
		for (const starting of entry) {
			insertBook.run(book.id, starting.id, starting.name, starting.content);
		}
	});
	insertBooks(starting);
}

export async function bookshelf_listup() {
	// 매번 책을 새로로드중이니, 책이랑 스타팅을 따로 로드해서 쿼리 최적화를 할것

	// let book = {};
	let book = db
		.prepare(sql`
			SELECT
				*
			FROM
				C_Bookspine
		`)
		.all();
	console.log(book);
	return book;
}

export async function activebook_listup() {
	// 매번 책을 새로로드중이니, 책이랑 스타팅을 따로 로드해서 쿼리 최적화를 할것
	let book = db
		.prepare(sql`
			SELECT
				Bookspine.title,
				Book.session_id
			FROM
				C_Bookspine AS Bookspine
				JOIN F_Book AS Book ON Bookspine.id = Book.id
			GROUP BY
				session_id;
		`)
		.all();
	return book;
}

export async function read_bookdetail(id: string) {
	let id_desc = db
		.prepare(sql`
			SELECT
				Bookspine.id,
				Bookshelf.desc
			FROM
				C_Bookspine AS Bookspine
				-- FROM은 한개만 쓴대
				JOIN D_Bookshelf AS Bookshelf ON Bookspine.id = Bookshelf.id
			WHERE
				Bookspine.id = ?
		`)
		.get(id) as BookStruct;
	// 미리보기라 컨텐츠는 제외(잊지마!)
	let starting = db
		.prepare(sql`
			SELECT
				point_id,
				name
			FROM
				E_Starting
			WHERE
				id = ?;
		`)
		.all(id);
	// 합치기
	const book_details: object = { ...id_desc, starting };
	return book_details;
}

export async function read_book(book_id: string, type: ReadType[]) {
	const header = ReadBook.header(book_id);
	const chat = ReadBook.chat(book_id);
	const request = {
		// header,
		chat,
	};
	return request;
}

// 이거 시발 나중에 꼭 정규화해서 최적화 해야함, 아무리봐도 여기가 병목임 < 기초는 했음. 26.08.22
// 번외로 여긴 SSE처리해서 보내는중... 을 구분 할 수 있게 해야함, 실제 디비에 저장 됐는지 여부임
export async function add_page(book_id: string, role: string, content: string) {
	console.log(book_id);
	const page_id = uuidv4();
	const inject_starting = db
		.query(sql`
			INSERT INTO
				G_Pages (session_id, pid, role, content)
			VALUES
				(?, ?, ?, ?)
		`)
		.run(book_id, page_id, role, content);
	return book_id;
}

// 비효율적이어도 구현 먼저하자
// book이 가져야할것
// 1. 오리진 ID, 2. uuid4기반 ID, 3. 챗 ID, 챗내용
// 나중에 꼭 정규화로 쪼개야함
export async function clone_book(origin_id: string, point_id: string) {
	const book_id = uuidv4(); //클론 후 조인용 세션 아이디
	const page_id = uuidv4(); //최초 생성시 스타팅 포인트가 가질 페이지 아이디(For Svelte each_key_duplicate)

	const get_starting = db
		.query(sql`
			SELECT
				content
			FROM
				E_Starting
			WHERE
				id = ?
				AND point_id = ?;
		`)
		.get(origin_id, point_id);
	const get_system = db
		.query(sql`
			SELECT
				SYSTEM
			FROM
				D_Bookshelf
			WHERE
				id = ?;
		`)
		.get(origin_id);

	const inject_starting = db
		.query(sql`
			INSERT INTO
				G_Pages (session_id, pid, role, content)
			VALUES
				(?, ?, ?, ?)
		`)
		.run([book_id, page_id, 'system', get_starting.content]);

	const inject_system = db
		.query(sql`
			INSERT INTO
				I_Header (session_id, SYSTEM)
			VALUES
				(?, ?)
		`)
		.run([book_id, get_system.system]);

	const inject_book = db
		.query(sql`
			INSERT INTO
				F_Book (id, session_id)
			VALUES
				(?, ?)
		`)
		.run([origin_id, book_id]);
	return book_id;
}
