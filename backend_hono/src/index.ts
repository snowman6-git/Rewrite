import axios from "axios";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { models, chat, chat_listup, world_memory, reset_world_memory, getTokenSize } from "./routes/endpoint";
import { chatSSE_listen, chatSSE_announcement } from "./routes/chatSSE";

// 프론트 에러를 동의 없이 수집해도 되는지 알아보기
import { auto_report } from "./routes/collect";
import { serveStatic } from "hono/bun";

import { authMiddleware } from "./middleware/auth";

const app = new Hono();
app.use(
  cors({
    origin: "*",
    // ["http://localhost:5173", "http://192.168.0.72:5173"],
    // allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
    allowMethods: ["POST", "GET", "OPTIONS"],
    // exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    // maxAge: 600,
    credentials: true,
  }),
);
app.use("/img/*", serveStatic({ root: "./public" }));
app.use("/api/files/*", authMiddleware);

// GET 나중에는 지워야함, 이건 ㄹㅇ 중간자 서버역임, 아님 옵션을 루트에서도 수정가능하게 하던가
app.get("/", (c) => {
  return c.text("Hello Hono!");
});


// GET
app.get("/chat_listup", chat_listup)
app.get("/models", models);
app.get("/world_memory", world_memory);
app.get('/api/chat/stream', chatSSE_listen)


// POST
app.post("/chat", chat);
app.post("/reset_world_memory", reset_world_memory);
app.post("/api/chat/send", chatSSE_announcement);
app.post("/auto_report/:type", auto_report);
app.post("/getToken_size/:target", getTokenSize);

export default {
  port: 3002,
  host: "0.0.0.0",
  fetch: app.fetch,
};
