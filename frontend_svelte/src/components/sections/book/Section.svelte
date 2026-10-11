<script lang="ts">
	import UploadModal from '$components/Common/UploadModal.svelte';
	import EmptyState from '$components/Common/EmptyState.svelte';
	import ContextMenu from '$components/Common/ContextMenu.svelte';
	import Btn from '$components/Common/Btn.svelte';
	import Modal from '$components/Common/Modal.svelte';
	import BookCard from '$components/sections/book/BookCard.svelte';
	import BookPreview from '$components/sections/book/BookPreview.svelte';
	import { uploadFiles, loadBooks, deleteBook } from '$lib/api/book';
	import { useBookMenu } from '$lib/useBookMenu.svelte';
	import { toast } from '$lib/stores/toast.svelte';
	import { goto } from '$app/navigation';
	import type { Book } from '$lib/types';

	let { books = [] }: { books?: Book[] } = $props();

	let searchQuery = $state('');
	let sortBy = $state<'popular' | 'usage' | 'created'>('popular');
	let filteredBooks = $state<Book[]>([]);
	let uploadInput = $state<HTMLInputElement>();
	let tomlUploadInput = $state<HTMLInputElement>();
	let showUploadModal = $state(false);
	let loaded = $state(false);
	// 첫 프레임부터 로딩: 빈 목록은 '데이터 0'이 아니라 '아직 안 옴'일 수 있다
	let loading = $state(books.length === 0);
	let loadErr = $state('');
	let selectedBook = $state<Book | null>(null);

	// 카드 컨텍스트 메뉴(우클릭/롱프레스) — 수정(생산 이동)·삭제
	const { menu, hide: hideContextMenu, show: showContextMenu, lp: cardLp } = useBookMenu<Book>();
	let deleting = $state(false);

	const menuItems = $derived.by(() => {
		const b = menu.book;
		if (!b) return [];
		return [
			{
				label: '수정 (생산으로)',
				icon: 'edit',
				onClick: () => {
					void goto(`/production?book=${encodeURIComponent(b.id)}`);
				}
			},
			{ separator: true },
			{
				label: '삭제',
				icon: 'trash',
				danger: true,
				onClick: () => (menu.confirm = b)
			}
		];
	});

	async function handleConfirmDelete() {
		if (!menu.confirm || deleting) return;
		deleting = true;
		try {
			await deleteBook(menu.confirm.id);
			toast.success('삭제되었습니다.');
			menu.confirm = null;
			// 목록 재로드 트리거: effect 조건(books 비어 + !loaded) 재만족
			loaded = false;
			books = [];
		} catch {
			toast.error('삭제에 실패했습니다.');
		} finally {
			deleting = false;
		}
	}

	function handleSearch(event: Event) {
		searchQuery = (event.target as HTMLInputElement).value;
	}

	function handleSort(event: Event) {
		sortBy = (event.target as HTMLButtonElement).dataset.sort as typeof sortBy;
	}

	async function handleUploadZip(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		try {
			const result = await uploadFiles([input.files[0]], 'zip');
			toast.success(`${result.count} 권의 책이 추가되었습니다.`);
		} catch (error) {
			console.error('ZIP 업로드 오류:', error);
			toast.error('업로드 실패: ' + (error as Error).message);
		}
	}

	async function handleUploadToml(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		try {
			const result = await uploadFiles(Array.from(input.files), 'toml');
			toast.success(`${result.books} 권 추가되었습니다.`);
		} catch (error) {
			console.error('TOML 업로드 오류:', error);
			toast.error('업로드 실패: ' + (error as Error).message);
		}
	}

	function reload() {
		loading = true;
		loadErr = '';
		loadBooks()
			.then((loadedBooks) => {
				books = loadedBooks;
			})
			.catch((error) => {
				// 실패를 빈 상태로 위장하면 사용자가 업로드를 다시 하게 된다 — 화면에 남긴다
				console.error('[Section] 책 로드 실패:', error);
				loadErr = '백엔드에 연결하지 못했어. 설정의 백엔드 주소를 확인해.';
				toast.error(loadErr);
			})
			.finally(() => {
				loading = false;
			});
	}

	$effect(() => {
		if (books.length === 0 && !loaded) {
			loaded = true;
			reload();
		}
	});

	$effect(() => {
		const allBooks = books.length > 0 ? books : [];
		let result = [...allBooks];
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(book) =>
					book.title.toLowerCase().includes(query) ||
					(book.author ?? '').toLowerCase().includes(query) ||
					(book.category ?? '').toLowerCase().includes(query)
			);
		}

		switch (sortBy) {
			case 'usage':
				result.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0));
				break;
			case 'created':
				result.sort(
					(a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
				);
				break;
			case 'popular':
				result.sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0));
				break;
		}

		filteredBooks = result;
	});
</script>

<div class="book-section">
	<!-- 컨트롤: 검색 + 정렬 + 업로드 -->
	<div class="controls">
		<input
			type="text"
			id="book-search"
			name="book-search"
			class="search-input"
			placeholder="이어서 쓰기"
			oninput={handleSearch}
			aria-label="검색"
		/>

		<div class="tools">
			<div class="sort-buttons">
				<button
					class="sort-btn"
					class:active={sortBy === 'popular'}
					data-sort="popular"
					onclick={handleSort}>인기</button
				>
				<button
					class="sort-btn"
					class:active={sortBy === 'usage'}
					data-sort="usage"
					onclick={handleSort}>활성화</button
				>
				<button
					class="sort-btn"
					class:active={sortBy === 'created'}
					data-sort="created"
					onclick={handleSort}>추가일자</button
				>
			</div>

			<button
				class="upload-btn"
				onclick={() => (showUploadModal = true)}
				aria-label="책 업로드"
				title="책 업로드">+</button
			>
		</div>
	</div>

	<!-- Grid -->
	<div class="book-grid">
		{#each filteredBooks as book (book.id)}
			<div
				class="card-hit"
				role="presentation"
				oncontextmenu={(e) => showContextMenu(e, book)}
				ontouchstart={(e) => {
					menu.lp = book;
					cardLp.ontouchstart(e);
				}}
				ontouchmove={cardLp.ontouchmove}
				ontouchend={cardLp.ontouchend}
				ontouchcancel={cardLp.ontouchcancel}
			>
				<BookCard {book} onClick={(b) => (selectedBook = b)} />
			</div>
		{/each}
	</div>

	<!-- 상태: 로딩 > 에러 > 빈 목록 (빈 화면은 '데이터 0'일 때만) -->
	{#if loading}
		<div class="center-state">
			<p class="state-text">책장을 불러오는 중...</p>
		</div>
	{:else if loadErr}
		<div class="center-state">
			<p class="state-text">{loadErr}</p>
			<Btn variant="save" onclick={reload}>다시 시도</Btn>
		</div>
	{:else if filteredBooks.length === 0}
		<EmptyState
			text={searchQuery ? '검색 결과가 없습니다' : '아직 책이 없습니다'}
			hint={searchQuery ? '다른 키워드로 검색해보세요' : '새로운 책을 추가해보세요'}
		/>
	{/if}

	{#if showUploadModal}
		<UploadModal
			onUploadZip={() => {
				showUploadModal = false;
				uploadInput?.click();
			}}
			onUploadToml={() => {
				showUploadModal = false;
				tomlUploadInput?.click();
			}}
			onCancel={() => (showUploadModal = false)}
		/>
	{/if}

	{#if selectedBook}
		<BookPreview book={selectedBook} onClose={() => (selectedBook = null)} />
	{/if}

	{#if menu.book}
		<ContextMenu items={menuItems} x={menu.x} y={menu.y} onClose={hideContextMenu} />
	{/if}

	{#if menu.confirm}
		<Modal
			title="책 삭제"
			message={`"${menu.confirm.title}" 책을 삭제하시겠습니까?`}
			variant="danger"
			confirmText="삭제"
			cancelText="취소"
			onConfirm={handleConfirmDelete}
			onCancel={() => (menu.confirm = null)}
		/>
	{/if}

	<!-- Hidden file inputs -->
	<input
		type="file"
		class="upload-input"
		accept=".zip"
		multiple={false}
		onchange={handleUploadZip}
		hidden
		bind:this={uploadInput}
	/>
	<input
		type="file"
		class="upload-input"
		accept=".toml"
		multiple={true}
		onchange={handleUploadToml}
		hidden
		bind:this={tomlUploadInput}
	/>
</div>

<style>
	.book-section {
		padding: var(--space-lg);
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: center;
	}

	.search-input {
		flex: 1;
		min-width: 200px;
		max-width: 320px;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		outline: none;
		transition: border-color var(--transition-fast);
	}

	.search-input:focus {
		border-color: var(--color-accent-primary);
	}

	.tools {
		margin-left: auto;
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.sort-buttons {
		display: flex;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		overflow: hidden;
	}

	.sort-btn {
		padding: var(--space-xs) var(--space-sm);
		min-height: 26px;
		border: none;
		background: transparent;
		color: var(--color-text-tertiary);
		font-size: var(--font-size-xs);
		cursor: pointer;
		white-space: nowrap;
		transition:
			color var(--transition-fast),
			background var(--transition-fast);
	}

	.sort-btn + .sort-btn {
		border-left: 1px solid var(--color-border);
	}

	.sort-btn.active {
		background: var(--color-accent-primary);
		color: var(--color-text-inverse);
	}

	@media (hover: hover) {
		.sort-btn.active:hover {
			background: var(--color-accent-secondary);
			color: var(--color-text-inverse);
		}
	}

	.upload-btn {
		width: 2.25rem;
		height: 2.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: var(--color-bg-secondary);
		color: var(--color-text-secondary);
		font-size: var(--font-size-base);
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			color var(--transition-fast);
	}

	@media (hover: hover) {
		.upload-btn:hover {
			border-color: var(--color-accent-primary);
			color: var(--color-text-primary);
		}
	}

	/* 카드 래퍼 — 레이아웃에서 투명 (자식 BookCard가 grid item 역할), 이벤트만 캐치 */
	.card-hit {
		display: contents;
	}

	.book-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--space-md);
		align-content: start;
		/* 스크롤은 .app-main이 소유 (min-height:auto라 여기서 넘치면 section가 자람) */
	}

	/* 상태 블록 (library/LibrarySection과 동일 언어) */
	.center-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--space-2xl) var(--space-md);
		text-align: center;
		gap: var(--space-sm);
	}

	.state-text {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin: 0;
	}

	@media (max-width: 768px) {
		.book-section {
			padding: var(--space-md);
		}
		.tools {
			margin-left: 0;
			width: 100%;
			justify-content: space-between;
		}
		.book-grid {
			/* 고정한 3열은 뷰포트와 함께 카드 폭을 깎는다 (320px → 카드 91px, 표지 43px).
			   최소 폭을 박고 열 개수를 흘려서 카드 크기를 보존한다. */
			grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
			gap: var(--space-sm);
		}
	}
</style>
