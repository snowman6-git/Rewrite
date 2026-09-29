<script lang="ts">
	import { apiBase, setApiBase } from '$lib/api/client';
	import { applyTheme, isThemeKey, type ThemeKey } from '$lib/assets/theme';
	import { checkHotpatch, installedVersion, patchStatus, setHubBase } from '$lib/hotpatch/loader.svelte';
	import { toast } from '$lib/stores/toast.svelte';

	const THEME_LABELS: Record<ThemeKey, string> = {
		mono: '모노크롬(기본)',
		indigo: '인디고(원본)'
	};

	let url = $state(typeof window === 'undefined' ? '' : (localStorage.getItem('rewrite_api_base') ?? apiBase()));
	let saved = $state(false);
	let hub = $state(typeof window === 'undefined' ? '' : (localStorage.getItem('rewrite_hotpatch_hub') ?? ''));
	let hubSaved = $state(false);
	let theme = $state<ThemeKey>(
		typeof window === 'undefined'
			? 'mono'
			: ((isThemeKey(localStorage.getItem('rewrite_theme')) ? localStorage.getItem('rewrite_theme') : 'mono') as ThemeKey)
	);

	function save() {
		const v = url.trim();
		if (!v) {
			toast.error('주소를 입력하세요.');
			return;
		}
		setApiBase(v);
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
		hubSaved = true;
		toast.success('저장됨 — 다음 확인부터 바로 반영');
	}

	function resetHub() {
		setHubBase(null);
		hub = '';
		hubSaved = false;
		toast.success('기본값으로 복원 — 다음 확인부터 바로 반영');
	}
</script>

<div class="settings-section">
	<h2 class="section-title">설정</h2>

	<div class="card">
		<label class="card-label" for="api-url">백엔드 주소</label>
		<p class="card-hint">API 요청이 가는 서버 주소. 비워두면 자동으로 감 (접속한 호스트:3000).</p>
		<div class="card-row">
			<input
				id="api-url"
				class="api-input"
				type="text"
				bind:value={url}
				oninput={() => (saved = false)}
				placeholder="http://192.168.0.36:3000"
				spellcheck="false"
			/>
		</div>
		<div class="card-actions">
			<button class="save-btn" onclick={save}>저장</button>
			<button class="reset-btn" onclick={reset}>기본값</button>
		</div>
		{#if saved}
			<p class="card-note">저장 완료. 다음 요청부터 바로 적용돼.</p>
		{/if}
	</div>

	<div class="card">
		<label class="card-label" for="hub-url">업데이트 주소 (핫패치)</label>
		<p class="card-hint">version.json과 UI 패치 zip을 서빙하는 서버. 비워두면 빌드 시 기본 주소 사용.</p>
		<div class="card-row">
			<input
				id="hub-url"
				class="api-input"
				type="text"
				bind:value={hub}
				oninput={() => (hubSaved = false)}
				placeholder="http://192.168.0.36:3999"
				spellcheck="false"
			/>
		</div>
		<div class="card-actions">
			<button class="save-btn" onclick={saveHub}>저장</button>
			<button class="reset-btn" onclick={resetHub}>기본값</button>
		</div>
		{#if hubSaved}
			<p class="card-note">저장 완료. 다음 확인부터 바로 적용.</p>
		{/if}
	</div>

	<div class="card">
		<p class="card-label">UI/UX 패치 (인앱 업데이트)</p>
		<p class="card-hint">새 UI가 배포되면 앱 시작 시 자동으로 설치된다. 여기서 수동 확인도 가능. Tauri 앱 전용.</p>
		<div class="card-row">
			<button class="save-btn" onclick={checkUpdate} disabled={patchStatus.phase === 'checking' || patchStatus.phase === 'downloading' || patchStatus.phase === 'applying'}>업데이트 확인</button>
			{#if patchStatus.phase === 'downloading' && patchStatus.total > 0}
				<span class="card-note">{Math.min(100, Math.round((patchStatus.received / patchStatus.total) * 100))}%</span>
			{/if}
		</div>
		<p class="card-note">
			{#if patchStatus.phase === 'checking'}확인중…{:else if patchStatus.phase === 'downloading'}다운로드중…{:else if patchStatus.phase === 'applying'}적용중…{:else if patchStatus.phase === 'latest'}최신 (v{patchStatus.version}){:else if patchStatus.phase === 'error'}실패: {patchStatus.message} — 임베드 유지{:else}설치됨: v{installedVersion()}{/if}
		</p>
	</div>

	<div class="card">
		<label class="card-label" for="theme-select">테마 (임시)</label>		<div class="card-row">
			<select id="theme-select" class="theme-select" bind:value={theme} onchange={() => {
				localStorage.setItem('rewrite_theme', theme);
				applyTheme(theme);
				toast.success(`테마: ${THEME_LABELS[theme]}`);
			}}>
				<option value="mono">모노크롬(기본)</option>
				<option value="indigo">인디고(원본)</option>
			</select>
		</div>
	</div>
</div>

<style>
	.settings-section {
		padding: var(--space-lg);
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
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
		font-weight: 600;
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
		font-family: var(--font-family);
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

	.save-btn,
	.reset-btn {
		padding: var(--space-xs) var(--space-md);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: background var(--transition-fast), border-color var(--transition-fast);
	}

	.save-btn {
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
		border: none;
	}

	.save-btn:hover {
		background: var(--color-accent-secondary);
	}

	.reset-btn {
		background: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}

	.reset-btn:hover {
		border-color: var(--color-text-tertiary);
		color: var(--color-text-primary);
	}

	.card-note {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		margin: 0;
	}

	.theme-select {
		flex: 1;
		background: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: var(--space-sm) var(--space-md);
		color: var(--color-text-primary);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		outline: none;
		cursor: pointer;
	}

	.theme-select:focus {
		border-color: var(--color-accent-primary);
	}

	@media (max-width: 768px) {
		.settings-section {
			padding: var(--space-md);
		}
	}
</style>
