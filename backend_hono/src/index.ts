import axios from 'axios';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { models, chat, chat_listup, world_edit, update_world_edit } from './handlers/endpoint';
import { chatSSE_listen, chatSSE_announcement } from './handlers/chatSSE';
import {
	book_upload,
	book_listup,
	book_unfolds,
	book_detail,
	library_listup,
	book_stats,
} from './handlers/book';
import { login } from './handlers/user';
// 프론트 에러를 동의 없이 수집해도 되는지 알아보기
import { auto_report } from './handlers/collect';
import { serveStatic } from 'hono/bun';

import { authMiddleware } from './middleware/auth';
import { init } from './lib/db';
import { book_remove, chat_delete } from './handlers/management';
import { ManageCharacter } from './handlers/character';
init();

const app = new Hono();
app.use(
	cors({
		origin: '*',
		// ["http://localhost:5173", "http://<LAN-IP>:5173"],
		// allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
		allowMethods: ['POST', 'GET', 'OPTIONS', 'DELETE', 'PATCH'],
		// exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
		// maxAge: 600,
		credentials: true,
	}),
);
app.use('/img/*', serveStatic({ root: './public' }));

// C안: 웹 빌드 서빙 — 프론트 변경은 `bun run build:ui`만으로 반영 (Tauri 리빌드 불필요)
// 폰/PC: http://<LAN-IP>:3000/ui/ — API base가 hostname:3000으로 파생되어 동일 오리진
const UI_BUILD = '../frontend_svelte/build-ui';
// HTML 전용 no-cache: 서빙보다 먼저 등록해 래핑 — serveStatic이 파일 히트 시 short-circuit(다음 미들웨어 스킵)이라
// 뒤에 두면 안 걸림. 캐시된 구 index + 새 빌드 해시 = asset 404 (2026-11-01 실측). 해시 자산은 컨텐트 어드레싱이라 불필요
app.use('/ui/*', async (c, next) => {
	await next();
	if (c.res.headers.get('content-type')?.includes('text/html')) {
		c.res.headers.set('cache-control', 'no-cache');
	}
});
app.use(
	'/ui/*',
	serveStatic({
		root: UI_BUILD,
		// serveStatic은 마운트 접두를 안 잘라줘 (root + 전체경로 조회) — /ui 접두를 여기서 제거
		rewriteRequestPath: (p) => p.replace(/^\/ui/, ''),
	}),
);
app.get('/ui/*', async (c) => {
	// SPA 폴백 — index는 캐시하지 않는다: build-ui 재빌드 시 해시가 바뀌는데 프로세스 메모에
	// 구 index가 남으면 asset 404 (몇 KB 로컬 읽기라 매 요청 읽기가 더 안전)
	return c.html(await Bun.file(`${UI_BUILD}/index.html`).text(), 200, {
		'cache-control': 'no-cache',
	});
});

// 앱 핫패치 hub: version.json + ui-v{N}.zip — `bun run publish:app`이 발행 (doc/hotpatch-doc.md)
app.use(
	'/hotpatch/*',
	serveStatic({
		root: '../frontend_svelte/hotpatch-out',
		rewriteRequestPath: (p) => p.replace(/^\/hotpatch/, ''),
	}),
);

app.use('/api/files/*', authMiddleware);

// GET 나중에는 지워야함, 이건 ㄹㅇ 중간자 서버역임, 아님 옵션을 루트에서도 수정가능하게 하던가
app.get('/', (c) => {
	return c.text('Hello Hono!');
});

const m_character = new ManageCharacter();

// GET
app.get('/chat_listup', chat_listup);
app.get('/models', models);
app.get('/world_edit', world_edit);
app.get('/api/chat/stream', chatSSE_listen);
app.get('/book_listup', book_listup);
app.get('/library_listup', library_listup);
app.get('/book_detail', book_detail);
app.get('/character', m_character.get_character);
app.get('/book_stats', book_stats);

// POST
app.post('/chat', chat);
app.post('/api/chat/send', chatSSE_announcement);
app.post('/auto_report/:type', auto_report);
app.post('/book_upload', book_upload);
app.post('/book_unfolds', book_unfolds);
app.post('/character', m_character.add_character);

app.post('/api/user/login', login);

// DELETE
app.delete('/book_delete', book_remove);
app.delete('/message/delete', chat_delete);
app.delete('/character', m_character.delete_character);

// PATCH
app.patch('/world_edit', update_world_edit);
app.patch('/character', m_character.update_character);

export default {
	port: 3000,
	host: '0.0.0.0',
	fetch: app.fetch,
};
