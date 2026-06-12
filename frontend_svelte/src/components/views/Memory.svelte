<script lang="ts">
	import axios from 'axios';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { chatState } from '$lib/states/chat.svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import { getTokenSize } from '$api/memory';
	import MinMaxPercent from '$components/MinMaxPercent.svelte';

	let world_memory: Array<JSON> = $state([]);
	let world_memory_size: number = $state(0);

	// 나중에 커지면 답 없으니까 디버그 모드용으로만 보기
	async function load_world_memory() {
		let request_world_memory = await axios.post(
			`${PUBLIC_API_URL}/world_memory`,
			{
				model: modelsState.selectedModel?.name
			},
			{}
		);

		// 이것도 나중엔 백엔드에서 처리하고 숫자값으로만 주기(성능문제)
		for (let content of request_world_memory.data) {
			world_memory += content['content'];
		}
		world_memory_size = await getTokenSize(`${world_memory}`);
	}

	// 세계 메모리 리셋 함수
	async function reset_world_memory() {
		let request_reset = await axios.post(`${PUBLIC_API_URL}/reset_world_memory`, {});
		if (request_reset.status === 200) {
			// 리셋하고나서 불러오기(앱은 F5가 안돼니까.)
			chatState.loadHistory();
			load_world_memory();
		}
	}
</script>

<div class="desc">기록된 메모리를 수정, 삭제합니다.</div>

<!-- 이따 생각하자 여긴 -->
{#await load_world_memory()}
	<textarea id="world_prompt">로딩중...</textarea>
{:then}
	<textarea id="world_prompt">{world_memory}</textarea>
{/await}
<br />
<!-- 나중에 예약된 프롬프트(혹은 시스템)등의 이름으로, 얘는 표기하지 않고 크기만 기입 -->
<div>
	{world_memory_size} / {modelsState.context_size} (<MinMaxPercent
		min={world_memory_size}
		max={modelsState.context_size}
	/>)
</div>
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
