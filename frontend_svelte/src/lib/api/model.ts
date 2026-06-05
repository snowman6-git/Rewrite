import { PUBLIC_API_URL } from '$env/static/public';
import axios from 'axios';

export async function model_listup() {
    try {
        const model_list_api = await axios.get(`${PUBLIC_API_URL}/models`, { timeout: 5000 });
        return model_list_api.data
        // $selectedModel = model_list.find((model) => model.sstatus === 'loaded') ?? model_list[0];
        // $isModel_loaded = true;
    } catch (error) {
        console.error("모델 리스트 로드 실패:", error);}
}
