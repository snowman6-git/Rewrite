<script lang="ts">
	import Desc from '$components/Common/Desc.svelte';
	import InputField from '$components/Common/InputField.svelte';
	import InputGroup from '$components/Common/InputGroup.svelte';

	let persona_name = $state('');
	let persona_desc = $state('');
</script>

<div class="persona-view view-container">
	<Desc>페르소나의 이름과 설명을 설정합니다.</Desc>

	<InputGroup label="이름" for="persona-name">
		<InputField
			id="persona-name"
			type="text"
			bind:value={persona_name}
			placeholder="페르소나 이름"
		/>
	</InputGroup>

	<InputGroup label="설명" for="persona-desc">
		<InputField
			id="persona-desc"
			type="textarea"
			bind:value={persona_desc}
			placeholder="페르소나 설명"
			rows="4"
		/>
	</InputGroup>
</div>

<style>
.persona-view {
	display: flex;
	flex-direction: column;
	gap: var(--space-md);
}
</style>
