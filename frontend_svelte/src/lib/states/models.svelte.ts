import { model_listup } from '$api/model';
import type { ModelInfo } from '$lib/types';

// 파이썬 객체지향이랑 비슷함
class ModelsState {
	list = $state<ModelInfo[]>([]);
	selectedId = $state<string | null>(null);
	isLoading = $state<boolean>(false);
	selectedModel = $derived(this.list.find((model) => model.id === this.selectedId) || null);
	context_size = $state<number>(0);

	async loadModels() {
		this.isLoading = true;
		try {
			this.list = (await model_listup()) || [];
			if (this.list.length > 0 && !this.selectedId) {
				this.selectedId =
					this.list.find((model) => model.status === 'loaded')?.id || this.list[0].id;
			}
			// 모델이 로드되고 컨텍사이즈를 찾아 할당으로 변경
			this.context_size = this.list[0]['context_size'] ?? 0
		} catch (error) {
			console.error(error);
		} finally {
			this.isLoading = false;
		}
	}
	selectModel(id: string) {
		this.selectedId = id;
	}
}
export const modelsState = new ModelsState();
