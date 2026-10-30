// 차후 에디터 api로 변경: Rewrite_Deskc
import { Database } from 'bun:sqlite';
import type { Context } from 'hono';
import { sql } from '../lib/sql';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('main.db');

export class ManageCharacter {
	async add_character(c: Context) {
		try {
			const { name, lore } = await c.req.json();
			const c_id = uuidv4();
			db.query(sql`
				INSERT INTO
					J_Characters (c_id, name, lore)
				VALUES
					(?, ?, ?)
			`).run(c_id, name, lore);
			c.status(200);
			return c.json({ success: true });
		} catch (error) {
			console.log(error);
			c.status(500);
			return c.json({ success: false });
		}
	}
	async update_character(c: Context) {
		try {
			const { c_id, name, lore } = await c.req.json();
			db.prepare(sql`
				UPDATE J_Characters
				SET
					c_name = ?,
					c_lore = ?
				WHERE
					c_id = ?
			`).run([name, lore, c_id]);
			c.status(200);
			return c.json({ success: true });
		} catch (error) {
			console.log(error);
			c.status(500);
			return c.json({ success: false });
		}
	}
	async get_character(c: Context) {
		try {
			const character_list = db.prepare('SELECT * FROM J_Characters;').all();
			return c.json(character_list);
		} catch (error) {
			console.log(error);
			return c.text('404');
		}
	}
	async delete_character(c: Context) {
		try {
			const c_id = c.req.query('c_id');
			if (!c_id) return c.json({ success: false, error: 'c_id 필수' }, 400);
			const result = db.prepare('DELETE FROM J_Characters WHERE c_id = ?').run(c_id);
			c.status(200);
			return c.json({ success: true });
		} catch (error) {
			console.log(error);
			c.status(500);
			return c.json({ success: false });
		}
	}
}
