<script lang="ts">
	import Desc from '$components/Common/Desc.svelte';
	import InputField from '$components/Common/InputField.svelte';

	let persona_name = $state('');
	let persona_desc = $state('');
</script>

<div class="persona-view">
	<Desc>페르소나의 이름과 설명을 설정합니다.</Desc>

	<div class="input-group">
		<label class="input-label" for="persona-name">이름</label>
		<InputField
			id="persona-name"
			type="text"
			bind:value={persona_name}
			placeholder="페르소나 이름"
		/>
	</div>

	<div class="input-group">
		<label class="input-label" for="persona-desc">설명</label>
		<InputField
			id="persona-desc"
			type="textarea"
			bind:value={persona_desc}
			placeholder="페르소나 설명"
			rows="4"
		/>
	</div>
</div>

<style>
	.persona-view {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-md);
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.input-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.persona-view {
			padding: var(--space-sm);
			gap: var(--space-sm);
		}
	}
</style>
