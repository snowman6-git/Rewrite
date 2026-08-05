<script lang="ts">
	import ContextMenu from '$components/Common/ContextMenu.svelte';
	import CardGrid from '$components/sections/CardGrid.svelte';

	interface ContextMenu {
		x: number;
		y: number;
		items: import('$components/Common/ContextMenu.svelte').MenuItem[];
		bookId?: number;
	}

	interface Book {
		id: number;
		title: string;
		author: string;
		category: string;
		status: 'reading' | 'completed' | 'wishlist';
		progress: number;
	}

	const lastReadBook: Book = {
		id: 2,
		title: '1984',
		author: 'George Orwell',
		category: 'Dystopian',
		status: 'reading',
		progress: 65
	};

	const otherBooks: Book[] = [
		{ id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Classic', status: 'completed', progress: 100 },
		{ id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Classic', status: 'wishlist', progress: 0 },
		{ id: 4, title: 'Dune', author: 'Frank Herbert', category: 'Sci-Fi', status: 'reading', progress: 40 },
		{ id: 5, title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Romance', status: 'completed', progress: 100 },
		{ id: 6, title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy', status: 'wishlist', progress: 0 }
	];

	let contextMenu = $state<ContextMenu | null>(null);
	let selectedBook = $state<Book | null>(null);
	let sectionRef: HTMLDivElement;

	$effect(() => {
		const cards = sectionRef?.querySelectorAll('.other-book-card') || [];
		const fns: (() => void)[] = [];

		cards.forEach((card) => {
			const handler = (e: Event) => {
				e.preventDefault();
				const title = card.querySelector('.other-book-title')?.textContent;
				const book = otherBooks.find(b => b.title === title);
				if (book) handleCardContextMenu(e as MouseEvent, book);
			};
			card.addEventListener('contextmenu', handler);
			fns.push(() => card.removeEventListener('contextmenu', handler));
		});

		return () => fns.forEach(fn => fn());
	});

	function handleCardContextMenu(e: MouseEvent, book: Book) {
		e.preventDefault();
		selectedBook = book;
		contextMenu = {
			x: e.clientX,
			y: e.clientY,
			items: [
				{ label: '삭제', icon: '🗑️', onClick: () => handleDelete(book) },
				{ label: '숨기기', icon: '👁️‍🗨️', onClick: () => handleHide(book) },
				{ label: '이름 바꾸기', icon: '✏️', onClick: () => handleRename(book) },
				{ separator: true },
				{ label: 'Reload', icon: '🔄', onClick: () => handleReload(book) }
			],
			bookId: book.id
		};
	}

	function handleCloseContextMenu() {
		contextMenu = null;
		selectedBook = null;
	}

	function handleDelete(book: Book) {
		// TODO: delete book
	}

	function handleHide(book: Book) {
		// TODO: hide book
	}

	function handleRename(book: Book) {
		// TODO: rename book
	}

	function handleReload(book: Book) {
		// TODO: reload book
	}
</script>

<div class="book-section" bind:this={sectionRef}>
	<!-- Header -->
	<header class="section-header">
		<h1>책장</h1>
		<p class="subtitle">프롬프트 선택 및 관리</p>
	</header>

	<!-- Search Bar -->
	<div class="search-bar">
		<div class="search-wrapper">
			<span class="search-icon">🔍</span>
			<input type="text" placeholder="책 제목, 저자, 카테고리 검색..." class="search-input" />
		</div>
		<button class="search-btn">
			<span class="btn-icon">🔍</span>
			<span class="btn-text">검색</span>
		</button>
	</div>

	<!-- Filter Tabs -->
	<div class="filter-tabs">
		<button class="tab active" data-filter="all">
			<span class="tab-icon">📚</span>
			<span class="tab-text">전체</span>
		</button>
		<button class="tab" data-filter="reading">
			<span class="tab-icon">📖</span>
			<span class="tab-text">읽는 중</span>
		</button>
		<button class="tab" data-filter="completed">
			<span class="tab-icon">✅</span>
			<span class="tab-text">완료</span>
		</button>
		<button class="tab" data-filter="wishlist">
			<span class="tab-icon">⭐</span>
			<span class="tab-text">위시리스트</span>
		</button>
	</div>

	<!-- Main Layout -->
	<div class="main-layout">
		<!-- Left: Last Read Book (Large) -->
		<section class="last-read-section">
			<h2 class="section-label">마지막으로 읽은 책</h2>
			<div class="last-read-card">
				<div class="last-read-cover">
					<div class="cover-gradient"></div>
				</div>
				<div class="last-read-info">
					<span class="category-badge-large">{lastReadBook.category}</span>
					<h3 class="last-read-title">{lastReadBook.title}</h3>
					<p class="last-read-author">{lastReadBook.author}</p>
					<div class="last-read-rating">
						<span class="stars">★★★★☆</span>
						<span class="rating-value">4.7</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Right: Other Books (Grid) -->
		<CardGrid title="다른 책들" items={otherBooks} />

		<!-- Context Menu -->
		{#if contextMenu}
			<ContextMenu
				items={contextMenu.items}
				x={contextMenu.x}
				y={contextMenu.y}
				onClose={handleCloseContextMenu}
			/>
		{/if}
	</div>
</div>

<style>
	.book-section {
		padding: var(--space-lg);
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.book-section {
			padding: var(--space-md);
		}

		.search-btn {
			align-self: flex-end;
		}
	}
</style>