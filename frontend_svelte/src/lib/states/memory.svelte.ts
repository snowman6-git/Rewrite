import { modelsState } from './models.svelte';

class MemoryTools {
	selectedModel = modelsState.selectedModel;

	// 여기서 할것
	// 1. 텍스트 투 토큰 2. 그게 컨텍윈도를 다 채우면 백에 요약요청 혹은 장기기억화 요청등 컨텍스트 메모리 관리
	// 파이썬 객체지향이랑 비슷함
	memory_usage = $state<number>(0);
	live_memory_usage = $state<number>(0);

	get safeMemoryUsage() {
		return this.memory_usage || 0;
	}

	get safeContextSize() {
		return modelsState.context_size || 1;
	}
}

export const memoryTools = new MemoryTools();
