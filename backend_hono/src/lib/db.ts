// 차후 에디터 api로 변경: Rewrite_Deskc
import { Database } from "bun:sqlite";
import { BookStruct } from "../types";
const db = new Database("main.db");
// db.run("PRAGMA journal_mode = WAL;");


// 일단 평범하게 시스프롬, 스타팅 포인트만 잡고, 나중에 안정화 돼면 시멘틱으로 바꾸자
function init(){
  db.prepare(` 
    CREATE TABLE IF NOT EXISTS book (
      id TEXT NOT NULL,
      cover TEXT NOT NULL,
      title TEXT NOT NULL,
      prompt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS E_img_assets (
      c_id INTEGER PRIMARY KEY,
      situation TEXT NOT NULL
    );
  `)
}


// A: idpw, B: userprofile
export async function bookshelf_upload(book: BookStruct){
  db.prepare(` 
    CREATE TABLE IF NOT EXISTS C_Bookshelf (
      book_id TEXT NOT NULL,
      cover TEXT NOT NULL,
      title TEXT NOT NULL,
      system TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS D_Starting (
      book_id TEXT NOT NULL,
      starting TEXT NOT NULL
    );
  `)

  // book넣는 하드클론 짜면됌
  db.prepare()
}