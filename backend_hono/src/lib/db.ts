// 차후 에디터 api로 변경: Rewrite_Deskc
import { Database } from 'bun:sqlite';
import { BookStruct } from '../types';
import { v4 as uuidv4 } from 'uuid';
const db = new Database('main.db');
// db.run("PRAGMA journal_mode = WAL;");

// 일단 평범하게 시스프롬, 스타팅 포인트만 잡고, 나중에 안정화 돼면 시멘틱으로 바꾸자
// DROP TABLE IF EXISTS E_Book;
// DELETE FROM E_Book;
export async function init() {
	const LibraryBlueprint = db.exec(`

    -- 프롬프트 원본
    CREATE TABLE IF NOT EXISTS C_Bookshelf (
	    id TEXT UNIQUE NOT NULL,
	    cover BLOB,
	    title TEXT NOT NULL,
	    desc TEXT NOT NULL,
	    system TEXT NOT NULL
	  );
    -- 스타팅
	  CREATE TABLE IF NOT EXISTS D_Starting (
      id TEXT NOT NULL,
      point_id TEXT NOT NULL,
	    name TEXT NOT NULL,
	    content TEXT NOT NULL,
      UNIQUE (id, point_id)
    );
    -- 채팅 기록 
    CREATE TABLE IF NOT EXISTS E_Book (
      id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      page_id TEXT NOT NULL,
      role TEXT NOT NULL,
	    content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
     `);
}

// 북 하나에 다 꼬라박고, 쿼리로 나누자
// -- 액티브 프롬프트 id는 업데이트 감지용 오리진 심링크
//     CREATE TABLE IF NOT EXISTS F_Active (
//       id TEXT NOT NULL,
//       book_id TEXT NOT NULL,
//       system TEXT NOT NULL,
// 	     TEXT NOT NULL,
//       timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
//     );

// 여유생기면 diff랑 버젼 해싱(혹은 날짜)
// A: idpw, B: userprofile
export async function bookshelf_upload(book: BookStruct) {
	// 스타팅도 ID지급 할것, 리스트 형태의 FOR문으로 저장할지 쿼리문 찾을지 찾을것
	// ON CONFLICT(book_id)
	// DO UPDATE SET title = excluded.starting;;`,
	db.query(
		`
	  INSERT OR REPLACE INTO C_Bookshelf (
	    id,
	    title,
	    desc,
	    system
	  ) VALUES (?, ?, ?, ?)`,
	).run([book.id, book.title, book.desc, book.system]);

	const insertBook = db.prepare(`
    INSERT OR REPLACE INTO D_Starting (
      id,
      point_id,
      name,
      content
    ) VALUES (?, ?, ?, ?);
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
		.prepare(
			`
      SELECT * FROM C_Bookshelf
      `,
		)
		.all();
	return book;
}

export async function activebook_listup() {
	// 매번 책을 새로로드중이니, 책이랑 스타팅을 따로 로드해서 쿼리 최적화를 할것

	// let book = {};
	let book = db
		.prepare(
			`
      SELECT book_id
      FROM E_Book
      GROUP BY book_id;
      `,
		)
		.all();
	return book;
}

export async function starting_points(id: string) {
	let starting_points = db
		.prepare(
			`
      SELECT point_id, name FROM D_starting WHERE id = (?)
      `,
		)
		.all(id);
	return starting_points;
}

export async function read_book(book_id: string) {
	let chat_list = db
		.prepare(
			`
      SELECT role, content FROM E_Book WHERE book_id = (?)
      `,
		)
		.all(book_id);
	return chat_list;
}

// 비효율적이어도 구현 먼저하자
// book이 가져야할것
// 1. 오리진 ID, 2. uuid4기반 ID, 3. 챗 ID, 챗내용
// 나중에 꼭 정규화로 쪼개야함
export async function clone_book(origin_id: string, point_id: string) {
	const starting = db
		.query(`SELECT content FROM D_Starting WHERE id = ? AND point_id = ?;`)
		.get(origin_id, point_id);

	const book_id = uuidv4();
	const page_id = uuidv4();
	db.query(
		`
	  INSERT OR REPLACE INTO E_Book (
	    id,
	    book_id,
	    page_id,
	    role,
      content
	  ) VALUES (?, ?, ?, ?, ?)`,
	).run([origin_id, book_id, page_id, 'assistant', starting['content']]);
	return book_id;
}
