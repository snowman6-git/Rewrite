// 차후 에디터 api로 변경: Rewrite_Deskc
import { Database } from 'bun:sqlite';
import type { Context } from 'hono';
import { sql } from '../lib/sql';

const db = new Database('main.db');

class ManageBook {
	static delete(id: string) {
		try {
			const book = db.prepare("DELETE FROM F_Book WHERE session_id = ?;").run(id);
			const header = db.prepare("DELETE FROM I_Header WHERE session_id = ?;").run(id);
			const pages = db.prepare("DELETE FROM G_Pages WHERE session_id = ?;").run(id);
			return true
		} catch (error) {
			return error
		}
	}
}

export async function book_remove(c: Context) {
	const { id } = c.req.query();
	// 북 시작시 북, 헤더, 페이지가 생성되고, 이는 세션아이디가 프라이머리키
	// = 삭제시 그거 기준으로 테이블 3개를 조져야함
	try {
		const book_delete = ManageBook.delete(id)
		return c.json({ "message": "ok" })
	} catch (error) {
		// aa2 일단은 이렇게 두고, 나중에 세분회
		c.status(500)
		return c.json({ "message": "server error" })
	}
}
