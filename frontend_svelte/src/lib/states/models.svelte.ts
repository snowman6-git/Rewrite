import { model_listup } from '$api/model';
import type { ModelInfo } from '$lib/types';

class ModelsState {
    // 1. 내부 변수(상태)들에 마법 서랍($state)을 지정합니다.
    list = $state<ModelInfo[]>([]);
    selectedId = $state<string | null>(null);
    isLoading = $state<boolean>(false);
    // 2. 파생 상태($derived) - 기존의 derived 스토어 역할을 대체합니다.
    // list나 selectedId가 바뀌면 이 "현재 선택된 모델 객체"도 실시간으로 자동 계산됩니다.
    selectedModel = $derived(
        this.list.find(model => model.id === this.selectedId) || null
    );
    // 3. 행동(Action) - API 통신 후 상태 서랍을 업데이트하는 함수입니다.
    async loadModels() {
        this.isLoading = true;
        try {
            this.list = await model_listup() || [];
            if (this.list.length > 0 && !this.selectedId) {
                this.selectedId = this.list[0].id; // 기본적으로 첫 번째 모델 선택
            }
            console.log("모델 리스트 로드 성공:", this.list);
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
// 하나의 싱글톤 인스턴스를 만들어 수출(export)합니다. 
// 이제 어느 컴포넌트에서든 얘를 불러오면 똑같은 데이터 방을 공유합니다.
export const modelsState = new ModelsState();