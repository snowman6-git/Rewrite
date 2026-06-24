<script lang="ts">
	import axios from 'axios';
	import { PUBLIC_API_URL } from '$env/static/public';
	import { chatState } from '$lib/states/chat.svelte';
	import { modelsState } from '$lib/states/models.svelte';
	import MinMaxPercent from '$components/MinMaxPercent.svelte';
	import { memoryTools } from '$lib/states/memory.svelte';

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

<!-- 차후 요약 메모리를 오브젝트로 받아 렌더링 -->
<!-- {#await load_world_memory()}
	<textarea id="world_prompt">로딩중...</textarea>
{:then}
	<textarea id="world_prompt">{world_memory}</textarea>
{/await} -->
<br />
<!-- 나중에 예약된 프롬프트(혹은 시스템)등의 이름으로, 얘는 표기하지 않고 크기만 기입 -->
<div>
	{memoryTools.memory_usage} / {modelsState.context_size} (<MinMaxPercent
		min={memoryTools.memory_usage}
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
