import axios from 'axios';
import { modelsState } from './models.svelte';
import { PUBLIC_API_URL } from '$env/static/public';
// 여기서 할것
// 1. 텍스트 투 토큰 2. 그게 컨텍윈도를 다 채우면 백에 요약요청 혹은 장기기억화 요청등 컨텍스트 메모리 관리
// 파이썬 객체지향이랑 비슷함

class MemoryTools {
	// 백엔드 요청에 모델이 필요하니 받아옴
	selectedModel = modelsState.selectedModel

	async getMemoryUsage() {
		const get_usage_memory_info = await axios.post(
			`${PUBLIC_API_URL}/getToken_size/memory`,
			{
				model: modelsState.selectedModel?.name
			},
			{}
		)
		const usage_memory = get_usage_memory_info.data
		return usage_memory
	}
}
export const memoryTools = new MemoryTools();
