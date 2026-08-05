<script lang="ts">
	import CardGrid from '$components/sections/CardGrid.svelte';
	interface Project {
		id: number;
		title: string;
		author: string;
		category: string;
		status: 'reading' | 'completed' | 'wishlist';
		progress: number;
	}

	const lastReadProject: Project = {
		id: 2,
		title: '프로젝트 Beta',
		author: '최근 수정',
		category: 'SF 단편 모음',
		status: 'reading',
		progress: 65
	};

	const otherProjects: Project[] = [
		{ id: 1, title: '프로젝트 Alpha', author: 'F. Scott Fitzgerald', category: 'Classic', status: 'completed', progress: 100 },
		{ id: 3, title: '프로젝트 Gamma', author: 'Harper Lee', category: 'Classic', status: 'wishlist', progress: 0 },
		{ id: 4, title: '프로젝트 Delta', author: 'Frank Herbert', category: 'Sci-Fi', status: 'reading', progress: 40 },
		{ id: 5, title: '프로젝트 Epsilon', author: 'Jane Austen', category: 'Romance', status: 'completed', progress: 100 },
		{ id: 6, title: '프로젝트 Zeta', author: 'J.R.R. Tolkien', category: 'Fantasy', status: 'wishlist', progress: 0 }
	];
</script>

<div class="production-section">
	<!-- Header -->
	<header class="section-header">
		<h1>제작</h1>
		<p class="subtitle">프로젝트 관리 및 진행 상황</p>
	</header>

	<!-- Main Layout -->
	<div class="main-layout">
		<!-- Left: Last Read Project (Large) -->
		<section class="last-read-section">
			<h2 class="section-label">마지막으로 수정한 프로젝트</h2>
			<div class="last-read-card">
				<div class="last-read-cover">
					<div class="cover-gradient"></div>
				</div>
				<div class="last-read-info">
					<span class="category-badge-large">{lastReadProject.category}</span>
					<h3 class="last-read-title">{lastReadProject.title}</h3>
					<p class="last-read-author">{lastReadProject.author}</p>
					<div class="last-read-rating">
						<span class="stars">★★★★☆</span>
						<span class="rating-value">4.5</span>
					</div>
				</div>
			</div>
		</section>

		<!-- Right: Other Projects (Grid) -->
		<CardGrid title="다른 프로젝트들" items={otherProjects} />
	</div>
</div>

<style>
	.production-section {
		padding: var(--space-lg);
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.production-section {
			padding: var(--space-md);
		}

		.last-read-cover {
			width: 100px;
			height: 140px;
		}

		.last-read-title {
			font-size: var(--font-size-xl);
		}
	}
</style>