<script lang="ts">
	import axios from 'axios';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { chatState } from '$lib/states/chat.svelte';

	let world_memory = $state('');

	async function load_world_memory() {
		let request_world_memory = await axios.get(`${PUBLIC_API_URL}/world_memory`, {});
		world_memory = request_world_memory.data;
		console.log(world_memory);
	}

	// 세계 메모리 리셋 함수
	async function reset_world_memory() {
		let request_reset = await axios.post(`${PUBLIC_API_URL}/reset_world_memory`, {});
		if (request_reset.status === 200) {
			// 리셋하고나서 불러오기(앱은 F5가 안돼니까.)
			chatState.loadHistory();
		}
	}
</script>

<div class="desc">기록된 메모리를 수정, 삭제합니다.</div>

<!-- 이따 생각하자 여긴 -->
<!-- {#await load_world_memory()}
	<textarea id="world_prompt">로딩중...</textarea>
{:then}
	
{/await} -->

<div id="btn_case">
	<button onclick={reset_world_memory}>리셋</button>
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
