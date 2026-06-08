import { Database } from "bun:sqlite";
import { getSystemPrompt, assistant_prompt, start_up_prompt } from "../static/prompt";
import { Context } from "hono";

import * as dotenv from "dotenv";

dotenv.config();

// const db = new Database(":memory:");
// db.query(` 
//     CREATE TABLE IF NOT EXISTS chat_history (
//         id TEXT NOT NULL,
//         sender TEXT NOT NULL,
//         content TEXT NOT NULL,
//         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
//     );
// `).run();

let chat_history: Array<object> = [
    { role: "system", content: `${getSystemPrompt(process.env.TEST_IMG_URL!, process.env.TEST_NAME!, process.env.TEST_PERSONA!)}` },
    { role: "assistant", content: `${assistant_prompt}` },
]

export async function reset_chat_history() {
    chat_history = [
    ];
}

// 나중엔 세션기반으로 로드해야함, 지금은 고정세션이니 바로리턴
export async function system_prompt(c: Context) {
    return c.text(`${getSystemPrompt(process.env.TEST_IMG_URL!, process.env.TEST_NAME!, process.env.TEST_PERSONA!)}`)
}


// 세션 관련 라우트들, 세션은 일단 간단하게 DB에 저장하는 형태로 구현, 나중에 Redis나 다른 스토리지로 변경 가능
export async function add_chat_history(id: string, sender: string, content: string) {
    chat_history.push({ "role": sender, "content": content });
}
export async function load_chat_history() {
    return chat_history;
}
