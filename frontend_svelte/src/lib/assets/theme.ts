// 테마 = 파일 단위로 분리, 선택 시에만 동적 import로 주입(다운로드 식)
// 각 테마의 style 노드를 캐시해 두고, 활성 테마 노드만 DOM에 붙인다.
// 빠른 스왑 안전: 모든 apply가 최신 `desired`를 읽어 마지막 선택이 이긴다.
export type ThemeKey = 'mono' | 'indigo';

const loaders: Record<Exclude<ThemeKey, 'mono'>, () => Promise<unknown>> = {
	indigo: () => import('./themes/indigo.css')
};

const nodes = new Map<Exclude<ThemeKey, 'mono'>, HTMLStyleElement>();
const pending = new Map<Exclude<ThemeKey, 'mono'>, Promise<void>>();

function inject(key: Exclude<ThemeKey, 'mono'>): Promise<void> {
	if (!pending.has(key)) {
		const before = new Set(document.querySelectorAll('style'));
		pending.set(
			key,
			loaders[key]().then(() => {
				const node = [...document.querySelectorAll('style')].find((s) => !before.has(s));
				if (node) nodes.set(key, node as HTMLStyleElement);
			})
		);
	}
	return pending.get(key)!;
}

let desired: ThemeKey = 'mono';

function apply() {
	for (const [k, n] of nodes) {
		const show = k === desired;
		if (show && !document.contains(n)) document.head.appendChild(n);
		if (!show && document.contains(n)) n.remove();
	}
	if (desired === 'mono') document.documentElement.removeAttribute('data-theme');
	else document.documentElement.dataset.theme = desired;
}

export async function applyTheme(t: ThemeKey) {
	desired = t;
	if (t !== 'mono') await inject(t);
	apply();
}

export function isThemeKey(v: string | null): v is ThemeKey {
	return v === 'mono' || v === 'indigo';
}
