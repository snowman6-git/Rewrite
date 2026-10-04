// 인앱 프론트 핫패치 로더 — doc/hotpatch-doc.md §4
// Tauri 환경에서만 동작. 웹/개발 = 즉시 skip.
// 실패는 "임베드 프론트로 폴백" — 앱 부팅을 막아선 안 됨.

const HUB = import.meta.env.PUBLIC_HOTPATCH_HUB ?? 'https://forgejo.aa2.uk/aa2/rewrite-ui';
const LS_KEY = 'rewrite_ui_ver';
const TIMEOUT_MS = 5000;

export type PatchPhase =
	| 'idle' // 자동: 무관심(웹/최신/오류 후 숨김)
	| 'checking' // manifest 확인
	| 'downloading' // zip 수신
	| 'applying' // save+extract
	| 'done' // 설치 완료(리로드 직전)
	| 'latest' // 수동: 새 버전 없음
	| 'error'; // 수동: 실패 (message에 원인)

// 스플래시/설정이 공유하는 상태
export const patchStatus = $state<{ phase: PatchPhase; received: number; total: number; version: number; message: string }>({
	phase: 'idle',
	received: 0,
	total: 0,
	version: 0,
	message: ''
});

export function installedVersion(): number {
	return typeof window === 'undefined' ? 0 : Number(localStorage.getItem(LS_KEY) ?? 0);
}

function isTauri(): boolean {
	return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// 리로드 루프 방지: 패치 설치 성공 후 ?hotpatch=1로 리로드 → 그 리로드에선 스킵
function consumeLoopFlag(): boolean {
	try {
		const url = new URL(window.location.href);
		if (!url.searchParams.has('hotpatch')) return false;
		url.searchParams.delete('hotpatch');
		window.history.replaceState(null, '', url.toString());
		return true;
	} catch {
		return false;
	}
}

async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
	const ctrl = new AbortController();
	const t = setTimeout(() => ctrl.abort(), timeout);
	try {
		return await fetch(url, { signal: ctrl.signal });
	} finally {
		clearTimeout(t);
	}
}

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', buf);
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function bufferToBase64(buf: ArrayBuffer): string {
	const bytes = new Uint8Array(buf);
	let bin = '';
	const CH = 0x8000;
	for (let i = 0; i < bytes.length; i += CH) {
		bin += String.fromCharCode(...bytes.subarray(i, i + CH));
	}
	return btoa(bin);
}

interface VersionManifest {
	ver: number;
	sha256: string;
	url: string;
}

let running = false;

/**
 * 자동(부팅, manual=false) / 수동(설정, manual=true) 체크.
 * 새 버전 설치 성공 시 ?hotpatch=1과 함께 페이지를 리로드한다.
 */
export async function checkHotpatch(manual = false): Promise<void> {
	if (running) return;
	running = true;
	const st = patchStatus;
	try {
		if (!isTauri()) {
			st.phase = 'error';
			st.message = '웹에서는 사용할 수 없습니다 (Tauri 앱 전용).';
			return;
		}
		if (!manual && consumeLoopFlag()) return;

		const installed = installedVersion();
		st.phase = 'checking';
		st.received = 0;
		st.total = 0;
		st.message = '';

		const resp = await fetchWithTimeout(`${HUB}/version.json`, TIMEOUT_MS);
		if (!resp.ok) throw new Error(`version.json ${resp.status}`);
		const manifest = (await resp.json()) as VersionManifest;
		if (!manifest || !Number.isFinite(manifest.ver) || manifest.ver <= installed) {
			st.phase = 'latest';
			st.version = installed;
			return;
		}
		st.version = manifest.ver;

		st.phase = 'downloading';
		const zipResp = await fetchWithTimeout(manifest.url, TIMEOUT_MS * 3);
		if (!zipResp.ok) throw new Error(`zip ${zipResp.status}`);
		const total = Number(zipResp.headers.get('content-length') ?? 0);
		st.total = total;

		const chunks: Uint8Array[] = [];
		let received = 0;
		const reader = zipResp.body?.getReader();
		if (!reader) throw new Error('no stream');
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			if (value) {
				chunks.push(value);
				received += value.length;
				st.received = received;
			}
		}
		const buf = new Uint8Array(received);
		let off = 0;
		for (const c of chunks) {
			buf.set(c, off);
			off += c.length;
		}
		const hash = await sha256Hex(buf.buffer);
		if (hash !== manifest.sha256.toLowerCase()) throw new Error('sha256 mismatch');

		st.phase = 'applying';
		// SAFETY: Tauri 셸은 주입으로 `__TAURI_INTERNALS__.invoke`를 보장한다 (Tauri 2 런타임 계약).
		// isTauri() 게이트 통과 후 도달하므로 필드 존재는 호출 전 확인됨.
		const invoke: ((cmd: string, args: Record<string, unknown>) => Promise<unknown>) | undefined = (
			window as unknown as {
				__TAURI_INTERNALS__?: {
					invoke?: (cmd: string, args: Record<string, unknown>) => Promise<unknown>;
				};
			}
		).__TAURI_INTERNALS__?.invoke;
		if (typeof invoke !== 'function') throw new Error('invoke unavailable');
		await invoke('hotpatch_save', { ver: String(manifest.ver), dataBase64: bufferToBase64(buf.buffer) });
		await invoke('hotpatch_extract', { ver: String(manifest.ver) });

		localStorage.setItem(LS_KEY, String(manifest.ver));
		st.phase = 'done';
		window.location.replace(`${window.location.pathname}?hotpatch=1`);
	} catch (err) {
		console.error('[hotpatch] 폴백: 임베드 프론트 사용', err);
		st.phase = 'error';
		st.message = err instanceof Error ? err.message : String(err);
		// 자동 실행 시 스플래시를 잠시 보여주고 임베드로 폴백
		if (!manual) {
			setTimeout(() => {
				if (patchStatus.phase === 'error') patchStatus.phase = 'idle';
			}, 900);
		}
	} finally {
		running = false;
	}
}
