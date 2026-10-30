// 차후 에디터 api로 변경: Rewrite_Deskc
import { Database } from 'bun:sqlite';
import type { Context } from 'hono';
import { sql } from '../lib/sql';

const db = new Database('main.db');

export class ManageCharacter {
	add_character(c: Context) {
		return c.text('aa');
	}
	async get_character(c: Context) {
		try {
			const character_list = db.prepare('SELECT * FROM J_Character;').run();
			return c.json(character_list);
		} catch (error) {
			// return c.text('404');
		}
	}
}
