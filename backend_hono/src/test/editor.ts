// 차후 에디터 api로 변경: Rewrite_Deskc
import { Database } from "bun:sqlite";
const db = new Database("test-book-1.db");
db.run("PRAGMA journal_mode = WAL;");
// 이때 고유키값은 주지않는다, about이 그 역할을 할거고, 유저가 동적 추가 수정을 할거기때문.
db.run(` 
    CREATE TABLE IF NOT EXISTS A_book_preview (
        title TEXT NOT NULL,
        desc TEXT NOT NULL,
        cover BLOB NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastmodify_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS B_system_logic (
        prompt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS C_world_lore (
        lore_name TEXT NOT NULL,
        keyword TEXT,
        prompt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS D_characters (
        c_id INTEGER PRIMARY KEY,
        c_name TEXT NOT NULL,
        keyword TEXT,
        prompt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS E_img_assets (
        c_id INTEGER PRIMARY KEY,
        situation TEXT NOT NULL
    );
`)

db.run("PRAGMA wal_checkpoint(TRUNCATE);");
db.close()