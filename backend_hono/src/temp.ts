import { Database } from "bun:sqlite";
const db = new Database("../session.db");
db.run("DROP TABLE chat_history")