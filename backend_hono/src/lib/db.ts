// 차후 에디터 api로 변경: Rewrite_Deskc
import { Database } from 'bun:sqlite';
import { BookStruct, ReadType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { sql } from './sql';
const db = new Database('main.db');
// db.run("PRAGMA journal_mode = WAL;");
import * as dotenv from 'dotenv';

dotenv.config;
const SYSTEM_HEADER = process.env.SYSTEM_HEADER;

export class ReadBook {
	static chat(book_id: string) {
		// [cache-window] 50개 스텝 윈도우: 앵커가 50턴마다만 이동 → 에포크 내 prefix byte-안정 (캐시 ~98%)
		// 순 슬라이딩(last-50 고정)은 매 턴 prefix 불일치 = 캐시 100% 미스라 금지
		const total = db
			.prepare(`SELECT COUNT(*) AS c FROM G_Pages WHERE session_id = ?`)
			.get(book_id) as { c: number };
		const anchor = Math.max(0, Math.floor((total.c - 1) / 50) * 50);
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
					Pages.create_at ASC,
					Pages.rowid ASC
				LIMIT
					50
				OFFSET
					?;
			`)
			.all(book_id, anchor);
		return chat_list;
	}
	// [display-window] 화면용: 에포크와 무관하게 항상 최근 N개 (오름차순)
	static chatRecent(book_id: string, limit = 50) {
		const rows = db
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
					Pages.create_at DESC,
					Pages.rowid DESC
				LIMIT
					?;
			`)
			.all(book_id, limit) as { pid: string; role: string; content: string }[];
		return rows.reverse();
	}
	static chatCount(book_id: string) {
		const total = db
			.prepare(`SELECT COUNT(*) AS c FROM G_Pages WHERE session_id = ?`)
			.get(book_id) as { c: number };
		return total.c;
	}
	// [context-window] LLM용: append-only 프리픽스 + 최근 꼬리
	// Gemini 암묵 캐시는 "가장 긴 공통 접두어"에 걸리므로, 접두어는 붙어가는 쪽으로만 변해야 한다.
	// 예산을 넘길 때만 앞쪽을 에포크(50행) 단위로 잘라낸다 → 접두어 시작점은 에포크 경계에서만 움직인다.
	static chatContext(book_id: string, budget = 400, epoch = 50) {
		const total = ReadBook.chatCount(book_id);
		const start = total <= budget ? 0 : Math.floor((total - budget) / epoch) * epoch;
		return db
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
					Pages.create_at ASC,
					Pages.rowid ASC
				LIMIT
					?
				OFFSET
					?;
			`)
			.all(book_id, Math.max(0, total - start), start);
	}
	static header(book_id: string) {
		let db_header = db
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

		const header_combine = SYSTEM_HEADER! + '\n' + ReadBook.system(book_id);
		return header_combine;
	}
	static system(book_id: string) {
		let get_system: any = db
			.query(sql`
				SELECT
					Header.system
				FROM
					I_Header AS Header
					JOIN F_Book AS Book ON Header.session_id = Book.session_id
				WHERE
					Header.session_id = ?
			`)
			.get(book_id);
		return get_system.system;
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
			title TEXT NOT NULL,
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
	return book;
}

export async function activebook_listup() {
	// 매번 책을 새로로드중이니, 책이랑 스타팅을 따로 로드해서 쿼리 최적화를 할것
	let book = db
		.prepare(sql`
			SELECT
				Bookspine.title,
				Book.session_id,
				SUBSTR (Pages.content, 1, 40) || '...' AS lastLine, --SQL배우다보니까 신기한거 개많음, 애초에 백에서 줄여서 보내 네트워크 오버헤드 줄이자(이게 더 나은지는 검증필요)
				Pages.session_id
			FROM
				C_Bookspine AS Bookspine
				JOIN F_Book AS Book ON Bookspine.id = Book.id
				JOIN G_Pages AS Pages ON Book.session_id = Pages.session_id
			GROUP BY
				Book.session_id;

			ORDER BY
				Pages.create_at DESC --최신순
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

// 조건문으로 구분짓기 vs 함수로 나누기
// 디비 두번 호출인데 이게 옳을까?
export async function read_chat(book_id: string) {
	const pages = ReadBook.chat(book_id);
	return pages;
}
export async function read_header(book_id: string) {
	const header = ReadBook.header(book_id);
	return header;
}

// 이거 시발 나중에 꼭 정규화해서 최적화 해야함, 아무리봐도 여기가 병목임 < 기초는 했음. 26.08.22
// 번외로 여긴 SSE처리해서 보내는중... 을 구분 할 수 있게 해야함, 실제 디비에 저장 됐는지 여부임
export async function add_page(book_id: string, role: string, content: string) {
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

// export async function update_page(c: Context) {
//   const { book_id, pid, content } = await c.req.json();
//   if (!book_id || !pid || content == null) return c.json({ success: false, error: '필수 값 부족' }, 400);
//   await update_page(book_id, pid, content);
//   return c.json({ success: true });
// }

// 비효율적이어도 구현 먼저하자
// book이 가져야할것
// 1. 오리진 ID, 2. uuid4기반 ID, 3. 챗 ID, 챗내용
// 나중에 꼭 정규화로 쪼개야함
export async function clone_book(origin_id: string, point_id: string) {
	const book_id = uuidv4(); //클론 후 조인용 세션 아이디
	const page_id = uuidv4(); //최초 생성시 스타팅 포인트가 가질 페이지 아이디(For Svelte each_key_duplicate)
	try {
		// 하나의 트랜잭션 함수로 정의 (전체가 다 성공하거나, 하나라도 실패하면 롤백)
		const initializeBookSession = db.transaction((book_id, origin_id, page_id, point_id) => {
			// 1. F_Book 삽입
			db.prepare(sql`
				INSERT INTO
					F_Book (id, title, session_id)
				SELECT
					id,
					title,
					?
				FROM
					C_Bookspine
				WHERE
					id = ?
			`).run(book_id, origin_id);
			// 2. G_Pages 삽입
			db.prepare(sql`
				INSERT INTO
					G_Pages (session_id, pid, role, content)
				SELECT
					?,
					?,
					?,
					content
				FROM
					E_Starting
				WHERE
					point_id = ?
					AND id = ?
			`).run(book_id, page_id, 'system', point_id, origin_id);
			// 3. I_Header 삽입
			db.prepare(sql`
				INSERT INTO
					I_Header (session_id, SYSTEM)
				SELECT
					?,
					SYSTEM
				FROM
					D_Bookshelf
				WHERE
					id = ?
			`).run(book_id, origin_id);
		});

		// 실행할 때는 아래처럼 호출
		initializeBookSession(book_id, origin_id, page_id, point_id);

		return book_id;
	} catch (error) {
		console.log(error);
		return error;
	}
}
