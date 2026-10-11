import { model_listup } from '$api/model';
import type { ModelInfo } from '$lib/types';

// 파이썬 객체지향이랑 비슷함
class ModelsState {
	list = $state<ModelInfo[]>([]);
	selectedId = $state<string | null>(null);
	isLoading = $state<boolean>(false);
	selectedModel = $derived(this.list.find((model) => model.id === this.selectedId) || null);
	context_size = $state<number>(0);

	// 세션 캐싱: 목록이 이미 있으면 force 없이 재호출 시 네트워크를 타지 않음.
	// 모델 목록은 서버 로드 상태라 세션 중 사실상 정적 — book 진입 등 빈도 높은
	// 효과 호출에서 매번 GET /models를 막기 위한 것. 메뉴 명시 열람은 force=true.
	async loadModels(force = false) {
		if (!force && this.list.length > 0) return;
		this.isLoading = true;
		try {
			this.list = (await model_listup()) || [
				{
					id: 'none',
					provider: 'none',
					status: 'none',
					name: '로드실패',
					desc: '사소하건 말건, 모델로드가 실패했네요, 그래도 외롭지않게 마중나온 녀석이 있어 다행이죠?',
					context_size: 1
				}
			];
			if (this.list.length > 0 && !this.selectedId) {
				this.selectedId =
					this.list.find((model) => model.status === 'loaded')?.id || this.list[0].id;
			}
			// 모델이 로드되고 컨텍사이즈를 찾아 할당으로 변경
			this.context_size = this.selectedModel?.context_size ?? 0;
		} finally {
			this.isLoading = false;
		}
	}
	selectModel(id: string) {
		this.selectedId = id;
	}
}
export const modelsState = new ModelsState();
