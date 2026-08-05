<script lang="ts">
	import NavItem from './NavItem.svelte';
	import SettingItem from './SettingItem.svelte';

	interface SettingsSection {
		id: string;
		label: string;
		icon: string;
	}

	interface Setting {
		key: string;
		label: string;
		description?: string;
		value: boolean | string;
		type: 'toggle' | 'select';
		options?: string[];
	}

	const settingsSections: SettingsSection[] = [
		{ id: 'general', label: '일반', icon: '⚙️' },
		{ id: 'appearance', label: '외관', icon: '🎨' },
		{ id: 'notifications', label: '알림', icon: '🔔' },
		{ id: 'privacy', label: '개인정보', icon: '🔒' },
		{ id: 'advanced', label: '고급', icon: '🔧' }
	];

	const dummySettings: Setting[] = [
		{ key: 'language', label: '언어', description: '앱 언어를 선택하세요.', value: '한국어', type: 'select', options: ['한국어', 'English', '日本語'] },
		{ key: 'theme', label: '테마', description: '다크/라이트 테마 선택.', value: '다크', type: 'select', options: ['다크', '라이트', '시스템'] },
		{ key: 'autoSave', label: '자동 저장', description: '문서를 자동으로 저장합니다.', value: true, type: 'toggle' },
		{ key: 'notifications', label: '알림 수신', description: '새로운 알림을 받습니다.', value: true, type: 'toggle' },
		{ key: 'dataCollection', label: '데이터 수집 동의', description: '서비스 개선을 위해 데이터를 수집합니다.', value: false, type: 'toggle' }
	];

	let activeSection = $state('general');
</script>

<div class="settings-section">
	<!-- Header -->
	<header class="section-header">
		<h1>설정</h1>
		<p class="subtitle">앱 설정 및 선호도</p>
	</header>

	<div class="settings-layout">
		<!-- Sidebar Navigation -->
		<nav class="settings-nav">
			{#each settingsSections as section (section.id)}
				<NavItem
					label={section.label}
					icon={section.icon}
					active={section.id === activeSection}
					onClick={() => activeSection = section.id}
				/>
			{/each}
		</nav>

		<!-- Settings Content -->
		<main class="settings-content">
			<h2 class="content-title">{settingsSections.find(s => s.id === activeSection)?.label || '일반'} 설정</h2>
			<div class="settings-list">
				{#each dummySettings as setting (setting.key)}
					<SettingItem
						label={setting.label}
						description={setting.description}
						type={setting.type}
						value={setting.value}
						options={setting.options}
					/>
				{/each}
			</div>
		</main>
	</div>
</div>

<style>
	@media (max-width: 768px) {
		.settings-section {
			padding: var(--space-md);
		}
	}
</style>