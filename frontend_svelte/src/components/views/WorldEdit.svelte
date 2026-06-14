<script lang="ts">
	import axios from 'axios';
	import { PUBLIC_API_URL } from '$env/static/public';
	import MinMaxPercent from '$components/MinMaxPercent.svelte';
	import { modelsState } from '$lib/states/models.svelte';

	let system_prompt = $state('');
	let system_prompt_size = $state(0);

	async function load_system_prompt() {
		let request_system_prompt = await axios.get(`${PUBLIC_API_URL}/world_edit`, {});
		system_prompt = request_system_prompt.data;
	}
</script>

<div class="desc">세계의 규칙을 변경합니다.</div>
{#await load_system_prompt()}
	<textarea id="world_prompt">로딩중...</textarea>
{:then}
	<textarea bind:value={system_prompt} id="world_prompt"> </textarea>
{/await}
<br />
<div>
	글자수: {system_prompt.length} / 크기: {system_prompt_size} (<MinMaxPercent
		min={system_prompt_size}
		max={modelsState.context_size}
	/>)
</div>
<div id="btn_case">
	<button>취소</button>
	<button>저장</button>
</div>

<style>
	.desc {
		margin-top: 0.5rem;
		margin-bottom: 1rem;
		opacity: 0.75;
		font-size: 0.7rem;
	}
	#world_prompt {
		text-align: start;
		background-color: transparent;
		outline: none;
		padding: 0.5rem;
		border: 0.2rem solid grey;
		width: 100%;
		height: 100%;
	}
	#btn_case {
		margin-top: 1rem;
		width: 100%;
		display: flex;
		flex-direction: row;
		gap: 1rem;
	}
	button {
		width: 100%;
		font-size: 1.2rem;
		border: 0.2rem solid grey;
		text-align: center;
		padding: 0.5rem;
	}
</style>
