import { Database } from 'bun:sqlite';
import { v4 as uuidv4 } from 'uuid';
import { sql } from './sql';
const db = new Database('main.db');

export class EditBook {
	static system(book_id: string, prompt: string) {
		try {
			const update_system = db
			.prepare(`UPDATE I_Header SET system = ? WHERE session_id = ?`)
			.run(prompt, book_id);
			return true	
		} catch (error) {
			return false
		}
	}
	static rule(book_id: string) {
		const total = db
			.prepare(`SELECT COUNT(*) AS c FROM G_Pages WHERE session_id = ?`)
			.get(book_id) as { c: number };
		const anchor = Math.max(0, Math.floor((total.c - 1) / 50) * 50);
		let chat_list = db.prepare(sql``);
	}
}
