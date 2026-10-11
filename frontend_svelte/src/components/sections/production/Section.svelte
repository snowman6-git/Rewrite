<script lang="ts">
	import { v4 as uuidv4 } from 'uuid';
	import { page } from '$app/stores';
	import { apiBase } from '$api/client';
	import {
		buildBookToml,
		parseBookToml,
		tomlFileName,
		validateBookToml,
		type BookTomlData
	} from '$lib/toml/book';
	import { saveBookToml } from '$lib/toml/save';

	// uuid는 클라이언트만 발급 — 서버/클라이언트 값이 다르면 하이데이션 매칭 깨짐
	// (id가 TOML 미리보기 {@html}에 포함되므로 구조 불일치 → 서브트리 전체 폐기)
	let id = $state<string>('');
	$effect(() => {
		if (!id) id = uuidv4();
	});
	let title = $state('');
	let desc = $state('');
	let system = $state('');
	let starting = $state([{ name: '', content: '' }]);

	// 커버(이미지) — 책장 추가 시 FormData로 동승 (D_Bookshelf.cover BLOB, book_cover-doc.md 대기)
	let cover = $state<File | null>(null);
	let coverUrl = $state('');
	let coverInput: HTMLInputElement | undefined;

	let adding = $state(false);
	let saveMsg = $state<{ text: string; tone: 'ok' | 'err' } | null>(null);
	let savedFlash = $state(false);
	let fileInput: HTMLInputElement | undefined;
	let mobileView = $state<'form' | 'preview'>('form');

	const data = $derived<BookTomlData>({ id, title, desc, starting, system });
	const issues = $derived(validateBookToml(data));
	const canWrite = $derived(issues.length === 0);
	const toml = $derived(buildBookToml(data));
	const fileName = $derived(tomlFileName(data));
	const byteCount = $derived(new Blob([toml]).size);

	// — 미리보기 라인 분석: 섹션/키/문자열 구분 (다중줄 리터럴 블록 인식) —
	type PreviewLine =
		| { kind: 'section'; text: string }
		| { kind: 'kv'; key: string; rest: string }
		| { kind: 'text'; text: string };

	const lines = $derived.by<PreviewLine[]>(() => {
		const out: PreviewLine[] = [];
		let inBlock = false;
		for (const raw of toml.split('\n')) {
			if (inBlock) {
				out.push({ kind: 'text', text: raw });
				if (raw.trimEnd().endsWith('"""')) inBlock = false;
				continue;
			}
			const trimmed = raw.trimStart();
			if (trimmed.startsWith('[')) {
				out.push({ kind: 'section', text: raw });
			} else if (raw.includes('=')) {
				const i = raw.indexOf('=');
				out.push({ kind: 'kv', key: raw.slice(0, i), rest: raw.slice(i) });
			} else if (raw.trim()) {
				out.push({ kind: 'text', text: raw });
			} else {
				out.push({ kind: 'text', text: '' });
			}
			if ((raw.match(/"""/g) ?? []).length % 2 === 1) inBlock = true;
		}
		return out;
	});

	// <pre> 안은 Svelte 템플릿의 줄바꿈/탭이 콘텐츠로 렌더됨 (white-space: pre)
	// → 라인을 이스케이프된 HTML 문자열로 조립해 {@html}로 주입 (whitespace 0)
	function esc(s: string) {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	const linesHtml = $derived(
		lines
			.map((l) => {
				// 스타일 인라인 — 클래스는 {@html} 문자열 안에만 존재해서 CSS 분석기가 항상 false positive
				const base = 'display:block;min-height:1.7em';
				return l.kind === 'section'
					? `<span style="${base};color:var(--color-text-primary);font-weight:600">${esc(l.text)}</span>`
					: l.kind === 'kv'
						? `<span style="${base}"><span style="color:var(--color-text-secondary)">${esc(l.key)}</span>${esc(l.rest)}</span>`
						: `<span style="${base}">${esc(l.text)}</span>`;
			})
			.join('')
	);

	function addEntry() {
		starting.push({ name: '', content: '' });
	}

	function removeEntry(i: number) {
		starting = starting.filter((_, j) => j !== i);
		if (starting.length === 0) starting = [{ name: '', content: '' }];
	}

	function resetForm() {
		id = uuidv4();
		title = '';
		desc = '';
		system = '';
		starting = [{ name: '', content: '' }];
		saveMsg = null;
	}

	async function addToShelf() {
		if (!canWrite) {
			saveMsg = { text: issues[0].message, tone: 'err' };
			return;
		}
		adding = true;
		try {
			const fd = new FormData();
			fd.append('type', 'toml');
			fd.append('files', new File([toml], fileName, { type: 'application/toml' }));
			if (cover) fd.append('cover', cover); // cover 필드 백엔드 지원 대기 — book_cover-doc.md
			const res = await fetch(`${apiBase()}/book_upload`, {
				method: 'POST',
				body: fd,
				credentials: 'include'
			});
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			saveMsg = { text: '책장에 추가되었습니다.', tone: 'ok' };
		} catch (e) {
			saveMsg = {
				text: `책장 추가 실패 — ${e instanceof Error ? e.message : String(e)}`,
				tone: 'err'
			};
		} finally {
			adding = false;
		}
	}

	// 커버 선택/해제
	function onCoverPicked(e: Event) {
		const input = e.target as HTMLInputElement;
		const f = input.files?.[0];
		if (!f) return;
		if (coverUrl) URL.revokeObjectURL(coverUrl);
		cover = f;
		coverUrl = URL.createObjectURL(f);
		input.value = '';
	}

	// 책장 "수정" 진입: ?book={spine_id} → /book_toml 로드 → 폼 채움
	// (백엔드 엔드포인트 미구현 — book_toml-doc.md, 구현 전까지 에러 메시지 표시)
	let bookParam = $derived($page.url.searchParams.get('book'));
	$effect(() => {
		const b = bookParam;
		if (!b) return;
		void loadFromBookshelf(b);
	});

	async function loadFromBookshelf(spineId: string) {
		try {
			const res = await fetch(`${apiBase()}/book_toml?id=${encodeURIComponent(spineId)}`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			applyToml(await res.text());
		} catch {
			saveMsg = {
				text: '책을 불러오지 못했습니다. — 백엔드 /book_toml 미구현 또는 책 없음',
				tone: 'err'
			};
		}
	}

	function applyToml(text: string) {
		try {
			const d = parseBookToml(text);
			id = d.id;
			title = d.title;
			desc = d.desc;
			starting = d.starting;
			system = d.system;
			saveMsg = null;
		} catch (e) {
			saveMsg = {
				text: `불러오기 실패 — ${e instanceof Error ? e.message : String(e)}`,
				tone: 'err'
			};
		}
	}

	function handleLoad() {
		fileInput?.click();
	}

	function onFilePicked(e: Event) {
		const input = e.target as HTMLInputElement;
		const f = input.files?.[0];
		if (!f) return;
		f.text().then((t) => applyToml(t));
		input.value = ''; // 같은 파일 재선택 가능
	}

	function handleSave() {
		if (!canWrite) {
			saveMsg = { text: issues[0].message, tone: 'err' };
			return;
		}
		try {
			saveBookToml(data);
			saveMsg = { text: '다운로드를 시작했어요.', tone: 'ok' };
			savedFlash = true;
			setTimeout(() => (savedFlash = false), 900);
		} catch (e) {
			saveMsg = {
				text: `저장 실패 — ${e instanceof Error ? e.message : String(e)}`,
				tone: 'err'
			};
		}
	}
</script>

<div class="studio">
	<input
		type="file"
		accept=".toml"
		name="toml-file"
		class="visually-hidden-input"
		bind:this={fileInput}
		onchange={onFilePicked}
		tabindex="-1"
	/>
	<input
		type="file"
		accept="image/*"
		name="cover-image"
		class="visually-hidden-input"
		bind:this={coverInput}
		onchange={onCoverPicked}
		tabindex="-1"
	/>

	<!-- 좁은 창: 편집/미리보기 분리 탭 -->
	<nav class="mobile-tabs" aria-label="뷰">
		<button
			class="btn btn-ghost"
			class:active={mobileView === 'form'}
			onclick={() => (mobileView = 'form')}
		>
			편집
		</button>
		<button
			class="btn btn-ghost"
			class:active={mobileView === 'preview'}
			onclick={() => (mobileView = 'preview')}
		>
			미리보기
		</button>
	</nav>

	<!-- ============ 좌: 폼 ============ -->
	<div class="pane pane-form" class:off={mobileView !== 'form'}>
		<header class="form-header">
			<p class="form-status" class:form-status-err={saveMsg?.tone === 'err'}>
				{#if !canWrite}
					{issues[0].message}
				{:else if saveMsg}
					{saveMsg.text}
				{:else}
					칸을 채우면 책장에 추가돼
				{/if}
			</p>
			<div class="form-actions">
				<button
					class="btn btn-primary"
					onclick={addToShelf}
					disabled={!canWrite || adding}
					title={canWrite ? '책장에 추가' : '채워야 할 칸이 있어요'}
				>
					{adding ? '추가중...' : '책장에 추가'}
				</button>
				<button
					class="btn btn-ghost"
					onclick={handleSave}
					disabled={!canWrite}
					title={canWrite ? 'TOML 파일 다운로드' : '채워야 할 칸이 있어요'}
				>
					저장
				</button>
				<button class="btn btn-ghost" onclick={handleLoad}>불러오기</button>
				<button class="btn btn-ghost" onclick={resetForm}>초기화</button>
			</div>
		</header>

		<div class="form-body">
			<!-- 책 정보 -->
			<section class="group">
				<h2 class="group-title">책 정보</h2>
				<div class="field">
					<span class="label">북 커버 (선택)</span>
					<button
						class="cover-box"
						class:has-cover={!!coverUrl}
						onclick={() => coverInput?.click()}
						aria-label={cover ? '커버 변경' : '커버 업로드'}
					>
						{#if coverUrl}
							<img src={coverUrl} alt="커버 미리보기" />
						{:else}
							<span class="cover-plus">+</span>
						{/if}
					</button>
				</div>
				<div class="field">
					<label class="label" for="f-id">책 ID</label>
					<input id="f-id" class="input" type="text" bind:value={id} spellcheck="false" />
				</div>
				<div class="field">
					<label class="label" for="f-title">제목</label>
					<input id="f-title" class="input" type="text" bind:value={title} placeholder="책 제목" />
				</div>
				<div class="field">
					<label class="label" for="f-desc">소개</label>
					<textarea
						id="f-desc"
						class="input textarea"
						rows="2"
						bind:value={desc}
						placeholder="책 소개"
					></textarea>
				</div>
			</section>

			<!-- 시작점 -->
			<section class="group">
				<div class="group-head">
					<h2 class="group-title">시작점</h2>
					<button class="btn btn-ghost btn-sm" onclick={addEntry}>추가</button>
				</div>
				{#each starting as entry, i (i)}
					<div class="entry">
						<div class="entry-head">
							<span class="entry-id">{i + 1}</span>
							<input
								class="input input-name"
								type="text"
								name={`starting-name-${i}`}
								bind:value={entry.name}
								placeholder="시작점 이름"
								aria-label="시작점 이름"
							/>
							<button
								class="icon-btn"
								onclick={() => removeEntry(i)}
								disabled={starting.length === 1}
								aria-label="시작점 삭제"
								title="삭제">×</button
							>
						</div>
						<textarea
							class="input textarea textarea-content"
							name={`starting-content-${i}`}
							rows="4"
							bind:value={entry.content}
							placeholder="시작 내용"
							aria-label="시작 내용"
						></textarea>
					</div>
				{/each}
			</section>

			<!-- 시스템 프롬프트 -->
			<section class="group">
				<h2 class="group-title">시스템 프롬프트</h2>
				<textarea
					class="input textarea textarea-system"
					name="system-prompt"
					rows="7"
					bind:value={system}
					placeholder="전체 응답에 적용할 규칙"
					aria-label="시스템 프롬프트"
				></textarea>
			</section>
		</div>
	</div>

	<!-- ============ 우: 미리보기 ============ -->
	<div class="pane pane-preview" class:off={mobileView !== 'preview'}>
		<div class="preview-tab" class:flash={savedFlash}>
			<span class="tab-name">{fileName}</span>
			<span class="tab-meta">{byteCount.toLocaleString()} B</span>
		</div>
		<pre class="preview-code" aria-label="TOML 미리보기"><code>{@html linesHtml}</code></pre>
	</div>
</div>

<style>
	.studio {
		display: grid;
		grid-template-columns: minmax(340px, 46%) 1fr;
		flex: 1;
		min-height: 0;
		min-width: 0;
	}

	.visually-hidden-input {
		display: none;
	}

	.mobile-tabs {
		display: none;
	}

	.pane {
		min-width: 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}

	/* ---------- 좌: 폼 ---------- */
	.pane-form {
		border-right: 1px solid var(--color-border);
		background: var(--color-bg-primary);
	}

	.form-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-md);
		padding: var(--space-md) var(--space-lg);
		border-bottom: 1px solid var(--color-border-subtle);
		flex-shrink: 0;
	}

	/* 헤더 상태 라인 — 채워야 할 칸 안내 (본문 하단에서 이동) */
	.form-status {
		flex: 1;
		min-width: 0;
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-warning);
	}

	.form-status-err {
		color: var(--color-error);
	}

	.form-actions {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}

	.btn {
		padding: var(--space-xs) var(--space-md);
		min-height: 26px;
		border-radius: var(--radius-sm);
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition:
			background var(--transition-fast),
			border-color var(--transition-fast),
			color var(--transition-fast);
		white-space: nowrap;
	}

	.btn:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.btn-ghost {
		background: transparent;
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}

	@media (hover: hover) {
		.btn-ghost:hover:not(:disabled) {
			border-color: var(--color-text-tertiary);
			color: var(--color-text-primary);
		}
	}

	.btn-primary {
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
		border: 1px solid var(--color-accent-primary);
	}

	@media (hover: hover) {
		.btn-primary:hover:not(:disabled) {
			background: var(--color-accent-secondary);
			border-color: var(--color-accent-secondary);
		}
	}

	.btn-sm {
		padding: 2px var(--space-sm);
		font-size: var(--font-size-xs);
	}

	.form-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.group-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.group-title {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.label {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}

	.input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		outline: none;
		transition: border-color var(--transition-fast);
	}

	.input:focus {
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px var(--color-accent-glow);
	}

	.textarea {
		resize: vertical;
		min-height: 3rem;
		line-height: 1.6;
	}

	/* 북 커버 — + 박스 자체가 업로드 버튼 (클릭=선택/교체) */
	.cover-box {
		width: 3rem;
		height: 4rem; /* 3:4 — BookCard 표지 비율과 동일 */
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-tertiary);
		color: var(--color-text-tertiary);
		font-size: var(--font-size-lg);
		overflow: hidden;
		cursor: pointer;
		padding: 0;
	}

	@media (hover: hover) {
		.cover-box:hover {
			border-color: var(--color-accent-primary);
			color: var(--color-accent-primary);
		}
	}

	.cover-box.has-cover {
		border-style: solid;
	}

	.cover-box img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* 시작점 — 컨테이너 박스 제거: 번호 마커 + 둥근 인풋만 플로팅 */
	.entry {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.entry-head {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.entry-id {
		width: 1.4rem;
		height: 1.4rem;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full, 50%);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		background: var(--color-bg-tertiary);
	}

	.input-name {
		flex: 1;
		min-width: 0;
	}

	.icon-btn {
		width: 1.6rem;
		height: 1.6rem;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		color: var(--color-text-tertiary);
		font-size: var(--font-size-base);
		line-height: 1;
	}

	@media (hover: hover) {
		.icon-btn:hover:not(:disabled) {
			background: var(--color-bg-hover);
			color: var(--color-error);
		}
	}

	.icon-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.textarea-content,
	.textarea-system {
		font-size: var(--font-size-sm);
	}

	/* ---------- 우: 미리보기 ---------- */
	.pane-preview {
		background: var(--color-code-bg);
	}

	.preview-tab {
		display: flex;
		align-items: baseline;
		gap: var(--space-sm);
		padding: var(--space-sm) var(--space-md);
		background: var(--color-code-header-bg);
		border-bottom: 1px solid var(--color-code-border);
		flex-shrink: 0;
		font-family: var(--font-mono);
	}

	.preview-tab.flash {
		animation: tabFlash 0.9s ease;
	}

	@keyframes tabFlash {
		0%,
		100% {
			background: var(--color-code-header-bg);
		}
		30% {
			background: color-mix(in srgb, var(--color-success) 18%, var(--color-code-header-bg));
		}
	}

	.tab-name {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
	}

	.tab-meta {
		font-size: var(--font-size-xs);
		color: var(--color-code-header-text);
		margin-left: auto;
	}

	.preview-code {
		flex: 1;
		overflow: auto;
		margin: 0;
		padding: var(--space-md);
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		line-height: 1.7;
		color: var(--color-code-text);
		white-space: pre;
		tab-size: 4;
	}

	/* ---------- 좁은 창: 편집/미리보기 탭 분리 ---------- */
	@media (max-width: 640px) {
		/* 타이틀-버튼 한 줄 유지 불가: 2줄 분리 (타이틀→버튼) */
		.form-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--space-sm);
		}

		.form-actions {
			width: 100%;
			justify-content: space-between;
		}
	}

	@media (max-width: 900px) {
		.studio {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
		}

		.mobile-tabs {
			display: flex;
			gap: var(--space-xs);
			padding: var(--space-sm) var(--space-lg) 0;
		}

		.mobile-tabs .btn {
			flex: 1;
		}

		.mobile-tabs .btn.active {
			background: var(--color-accent-primary);
			border-color: var(--color-accent-primary);
			color: var(--color-text-inverse);
		}

		.pane.off {
			display: none;
		}

		.pane-form {
			border-right: none;
		}

		.pane-preview {
			border-top: 1px solid var(--color-border);
		}
	}
</style>
