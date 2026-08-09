import type { Context } from 'hono';

export async function login(c: Context) {
	const { id, pw } = await c.req.json();
	console.log(id, pw);

	return c.text('OK', 200);
}
