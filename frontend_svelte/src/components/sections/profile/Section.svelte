<script lang="ts">
	import StatCard from './StatCard.svelte';

	const dummyStats = [
		{ label: '책', value: 42, icon: '📚' }
	];
</script>

<div class="profile-section">
	<!-- Header with Cover -->
	<header class="profile-header">
		<div class="cover-image"></div>
		<div class="profile-info">
			<div class="avatar">
				<span class="avatar-initials">JD</span>
			</div>
			<div class="profile-details">
				<h1 class="profile-name">John Doe</h1>
				<p class="profile-role">Product Designer</p>
				<p class="profile-bio">창의적인 디자인과 사용자 경험을 추구합니다. 오픈소스 기여자.</p>
				<div class="profile-meta">
					<span class="meta-item">📍 San Francisco, CA</span>
					<span class="meta-item">🔗 janedoe.dev</span>
					<span class="meta-item">2024 년 1 월 가입</span>
				</div>
			</div>
			<div class="profile-actions">
				<button class="btn-primary">프로필 수정</button>
				<button class="btn-secondary">메시지</button>
			</div>
		</div>
	</header>

	<!-- Stats Grid -->
	<div class="stats-grid">
		{#each dummyStats as stat (stat.label)}
			<StatCard label={stat.label} value={stat.value} icon={stat.icon} />
		{/each}
	</div>

	</div>