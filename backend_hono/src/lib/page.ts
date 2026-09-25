// 차후 에디터 api로 변경: Rewrite_Deskc
import { Database } from 'bun:sqlite';
import { BookStruct, ReadType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { sql } from './sql';
const db = new Database('main.db');

export async function update_page(book_id: string, pid: string, content: string) {
  await db.prepare(sql`
    UPDATE G_Pages SET content = ? WHERE session_id = ? AND pid = ?
  `).run([content, book_id, pid]);
}