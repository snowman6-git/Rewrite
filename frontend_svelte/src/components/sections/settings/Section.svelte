<script lang="ts">
	import { apiBase, setApiBase } from '$lib/api/client';
	import { applyTheme, isThemeKey, type ThemeKey } from '$lib/assets/theme';
	import {
		applyScale,
		clampScale,
		readScale,
		SCALE_KEY,
		SCALE_MAX,
		SCALE_MIN
	} from '$lib/assets/scale';
	import {
		readStreamFx,
		STREAM_FX_KEY,
		STREAM_FX_LABELS,
		type StreamFx
	} from '$lib/assets/stream-fx';
	import {
		checkHotpatch,
		hotpatchEnabled,
		installedVersion,
		patchStatus,
		setHubBase,
		setHotpatchEnabled
	} from '$lib/hotpatch/loader.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { showcase } from '$lib/stores/showcase.svelte';
	import Btn from '$components/Common/Btn.svelte';
	import Switch from '../../Common/Switch.svelte';

	const THEME_LABELS: Record<ThemeKey, string> = {
		mono: '모노크롬(기본)',
		indigo: '인디고(원본)'
	};

	let url = $state(
		typeof window === 'undefined' ? '' : (localStorage.getItem('rewrite_api_base') ?? apiBase())
	);
	let saved = $state(false);
	let hub = $state(
		typeof window === 'undefined' ? '' : (localStorage.getItem('rewrite_hotpatch_hub') ?? '')
	);
	let hubSaved = $state(false);
	let hpOn = $state(typeof window === 'undefined' ? true : hotpatchEnabled());
	let theme = $state<ThemeKey>(
		typeof window === 'undefined'
			? 'mono'
			: ((isThemeKey(localStorage.getItem('rewrite_theme'))
					? localStorage.getItem('rewrite_theme')
					: 'mono') as ThemeKey)
	);
	let scale = $state(String(readScale()));
	let streamFx = $state<StreamFx>(typeof window === 'undefined' ? 'fade' : readStreamFx());

	// 스트림 효과 미리보기 — 청크씩 샘플 스트림 재생, 효과 변경 시 재재생 (ChatBlock과 같은 토큰 단위 동작)
	const FX_SAMPLE = '미리보기입니다. 토큰이 이렇게 들어와요.';
	let fxSample = $state('');
	let fxDone = $state(false);
	$effect(() => {
		fxSample = '';
		fxDone = false;
		if (streamFx === 'none') {
			fxSample = FX_SAMPLE;
			fxDone = true;
			return;
		}
		let i = 0;
		const id = setInterval(() => {
			i += 2;
			fxSample = FX_SAMPLE.slice(0, i);
			if (i >= FX_SAMPLE.length) {
				clearInterval(id);
				fxDone = true;
			}
		}, 90);
		return () => clearInterval(id);
	});
	// range 입력의 bind:value는 문자열로 온다 — 클램프는 여기서 한 번만
	const scaleNum = $derived(clampScale(Number(scale) || 1));

	function save() {
		const v = url.trim();
		if (!v) {
			toast.error('주소를 입력하세요.');
			return;
		}
		if (!setApiBase(v)) {
			toast.error('저장 안 됨 — 원거리는 https, 로컬(localhost·10.x·192.168.x)만 http 허용');
			return;
		}
		saved = true;
		toast.success('저장됨 — 새로고침 시 반영');
	}

	function reset() {
		setApiBase(null);
		url = apiBase();
		saved = false;
		toast.success('기본값으로 복원 — 새로고침 시 반영');
	}

	async function checkUpdate() {
		await checkHotpatch(true);
		if (patchStatus.phase === 'latest') toast.success(`최신입니다 (v${patchStatus.version}).`);
		else if (patchStatus.phase === 'error') toast.error(`업데이트 실패: ${patchStatus.message}`);
	}

	function saveHub() {
		const v = hub.trim();
		if (!v) {
			toast.error('주소를 입력하세요.');
			return;
		}
		setHubBase(v);
		// safeHub가 거르면 localStorage에 안 들어간다 → 저장된 값으로 확인해서 토스트를 진실하게 만든다
		const norm = v.trim().replace(/\/+$/, '');
		if (localStorage.getItem('rewrite_hotpatch_hub') !== norm) {
			hubSaved = false;
			toast.error('저장 안 됨 — 원거리는 https, 로컬(localhost·10.x·192.168.x)만 http 허용');
			return;
		}
		hubSaved = true;
		toast.success('저장됨 — 다음 확인부터 바로 반영');
	}

	function resetHub() {
		setHubBase(null);
		hub = '';
		hubSaved = false;
		toast.success('기본값으로 복원 — 다음 확인부터 바로 반영');
	}

	function toggleHp() {
		hpOn = !hpOn;
		setHotpatchEnabled(hpOn);
		toast.success(
			hpOn ? '앱 시작 시 자동 확인: ON' : '앱 시작 시 자동 확인: OFF (수동 확인은 그대로)'
		);
	}
</script>

<div class="settings-section">
	<div class="section-head">
		<h2 class="section-title">설정</h2>
	</div>

	<div class="card">
		<label class="card-label" for="api-url">백엔드 API</label>
		<p class="card-hint">API 요청이 가는 서버 주소. 비워두면 자동으로 감 (접속한 호스트:3000).</p>
		<div class="card-row">
			<input
				id="api-url"
				class="api-input"
				type="text"
				bind:value={url}
				oninput={() => (saved = false)}
				placeholder="http://<LAN-IP>:3000"
				spellcheck="false"
			/>
		</div>
		<div class="card-actions">
			<Btn variant="save" onclick={save}>저장</Btn>
			<Btn variant="cancel" onclick={reset}>기본값</Btn>
		</div>
		{#if saved}
			<p class="card-note">저장 완료. 새로고침하면 적용돼.</p>
		{/if}
	</div>

	<div class="card">
		<label class="card-label" for="hub-url">업데이트 주소 (핫패치)</label>
		<p class="card-hint">
			version.json과 UI 패치 zip을 서빙하는 서버. 비워두면 빌드 시 기본 주소 사용.
		</p>
		<div class="card-row">
			<input
				id="hub-url"
				class="api-input"
				type="text"
				bind:value={hub}
				oninput={() => (hubSaved = false)}
				placeholder="http://<LAN-IP>:3999"
				spellcheck="false"
			/>
		</div>
		<div class="card-actions">
			<Btn variant="save" onclick={saveHub}>저장</Btn>
			<Btn variant="cancel" onclick={resetHub}>기본값</Btn>
		</div>
		{#if hubSaved}
			<p class="card-note">저장 완료. 다음 확인부터 바로 적용.</p>
		{/if}
	</div>

	<div class="card">
		<p class="card-label">UI/UX 패치 (인앱 업데이트)</p>
		<p class="card-hint">
			새 UI가 배포되면 앱 시작 시 자동으로 설치된다. 여기서 수동 확인도 가능. Tauri 앱 전용.
		</p>
		<div class="card-row switch-row">
			<span class="switch-label">앱 시작 시 자동 확인</span>
			<Switch checked={hpOn} label="앱 시작 시 자동 확인" onToggle={toggleHp} />
		</div>
		<div class="card-row">
			<Btn
				variant="save"
				onclick={checkUpdate}
				disabled={patchStatus.phase === 'checking' ||
					patchStatus.phase === 'downloading' ||
					patchStatus.phase === 'applying'}>업데이트 확인</Btn
			>
			{#if patchStatus.phase === 'downloading' && patchStatus.total > 0}
				<span class="card-note"
					>{Math.min(100, Math.round((patchStatus.received / patchStatus.total) * 100))}%</span
				>
			{/if}
		</div>
		<p class="card-note">
			{#if patchStatus.phase === 'checking'}확인중…{:else if patchStatus.phase === 'downloading'}다운로드중…{:else if patchStatus.phase === 'applying'}적용중…{:else if patchStatus.phase === 'latest'}최신
				(v{patchStatus.version}){:else if patchStatus.phase === 'error'}실패: {patchStatus.message} —
				임베드 유지{:else}설치됨: v{installedVersion()}{/if}
		</p>
	</div>

	<div class="card">
		<p class="card-label">쇼케이스 모드</p>
		<p class="card-hint">ON이면 모든 책·서재 타이틀과 텍스트가 example으로 표시된다. UI 시연용.</p>
		<div class="card-row switch-row">
			<span class="switch-label">쇼케이스 모드</span>
			<Switch checked={showcase.on} label="쇼케이스 모드" onToggle={() => showcase.toggle()} />
		</div>
	</div>

	<div class="card">
		<label class="card-label" for="stream-fx">채팅 스트림 효과</label>
		<p class="card-hint">채팅 스트림 중 새 토큰이 도착할 때 효과. 다음 채팅 화면부터 반영.</p>
		<div class="card-row">
			<select
				id="stream-fx"
				class="theme-select"
				bind:value={streamFx}
				onchange={() => {
					localStorage.setItem(STREAM_FX_KEY, streamFx);
					toast.success(`스트림 효과: ${STREAM_FX_LABELS[streamFx]}`);
				}}
			>
				<option value="fade">페이드 인(기본)</option>
				<option value="none">효과 없음</option>
				<option value="pop">튀어오름</option>
			</select>
		</div>
		<div class="fx-preview">
			<span class="fx-bubble">
				{fxSample.slice(0, Math.max(0, fxSample.length - (fxDone ? 0 : 2)))}
				{#if !fxDone && fxSample.length > 0}
					<span
						class="fx-delta"
						class:fx-fade={streamFx === 'fade'}
						class:fx-pop={streamFx === 'pop'}>{fxSample.slice(-2)}</span
					>
				{/if}
			</span>
		</div>
	</div>

	<div class="card">
		<label class="card-label" for="theme-select">테마</label>
		<div class="card-row">
			<select
				id="theme-select"
				class="theme-select"
				bind:value={theme}
				onchange={() => {
					localStorage.setItem('rewrite_theme', theme);
					applyTheme(theme);
					toast.success(`테마: ${THEME_LABELS[theme]}`);
				}}
			>
				<option value="mono">모노크롬(기본)</option>
				<option value="indigo">인디고(원본)</option>
			</select>
		</div>
	</div>

	<div class="card">
		<label class="card-label" for="scale-range">UI 배율 · {Math.round(scaleNum * 100)}%</label>
		<div class="card-row">
			<input
				id="scale-range"
				class="scale-range"
				type="range"
				min={SCALE_MIN}
				max={SCALE_MAX}
				step={0.05}
				bind:value={scale}
				oninput={() => applyScale(scaleNum)}
				onchange={() => {
					localStorage.setItem(SCALE_KEY, String(scaleNum));
					toast.success(`UI 배율: ${Math.round(scaleNum * 100)}%`);
				}}
			/>
		</div>
		<p class="card-note">
			레이아웃이 너무 크면 낮춰. rem·em 토큰만 스케일되고 화면 폭은 그대로 유지된다.
		</p>
	</div>
</div>

<style>
	.settings-section {
		padding: var(--space-lg);
		flex: 1;
		min-width: 0;
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		/* 스크롤은 .app-main 단일 소유 (다른 섹션과 동일) — 여기서 넘기면 헤더가 섹션 안에서 먼저 사라진다 */
	}

	/* 등장인물·서재의 헤더 행과 같은 높이(아이콘 버튼 2.25rem) → 제목 baseline 통일 */
	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 2.25rem;
	}

	.section-title {
		font-size: var(--font-size-lg);
		color: var(--color-text-primary);
		margin: 0;
	}

	.card {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-md);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.card-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
	}

	.card-hint {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	.card-row {
		display: flex;
		gap: var(--space-xs);
	}

	.api-input {
		flex: 1;
		min-width: 0;
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		outline: none;
		transition: border-color var(--transition-fast);
	}

	.api-input:focus {
		border-color: var(--color-accent-primary);
	}

	.card-actions {
		display: flex;
		gap: var(--space-xs);
	}

	.card-note {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		margin: 0;
	}

	.switch-row {
		justify-content: space-between;
		align-items: center;
	}

	.switch-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
	}

	.theme-select {
		flex: 1;
		min-height: 2.25rem;
		appearance: none;
		-webkit-appearance: none;
		background: var(--color-bg-tertiary)
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23a0a0a0' stroke-width='1.5'/%3E%3C/svg%3E")
			no-repeat right var(--space-md) center;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) calc(var(--space-md) + 1.5rem) var(--space-sm) var(--space-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		outline: none;
		cursor: pointer;
	}

	.theme-select:focus {
		border-color: var(--color-accent-primary);
	}

	/* 스트림 효과 미리보기 — ChatBlock.svelte와 동일한 keyframes (scoped 스타일 공유 불가라 고의 중복) */
	.fx-preview {
		margin-top: var(--space-sm);
	}

	.fx-bubble {
		display: inline-block;
		max-width: 100%;
		padding: var(--space-sm) var(--space-md);
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		line-height: 1.6;
	}

	.fx-delta.fx-pop {
		display: inline-block;
	}

	.fx-delta.fx-fade {
		animation: fx-token-fade 200ms ease-out both;
	}

	.fx-delta.fx-pop {
		animation: fx-token-pop 380ms ease-in-out both;
	}

	@keyframes fx-token-fade {
		from {
			opacity: 0;
		}
	}

	/* 파도: 밀물(crest) → 물러남 → 잔물결 정지 (ChatBlock과 동일) */
	@keyframes fx-token-pop {
		0% {
			opacity: 0;
			transform: translateY(6px) scale(0.9);
		}
		55% {
			opacity: 1;
			transform: translateY(-2px) scale(1.04);
		}
		80% {
			transform: translateY(1px) scale(0.99);
		}
		100% {
			opacity: 1;
			transform: none;
		}
	}

	@media (max-width: 768px) {
		.settings-section {
			padding: var(--space-md);
		}
	}
</style>
