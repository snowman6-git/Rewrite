import axios from 'axios';
import type { ModelInfo } from '$lib/types';
import { PUBLIC_API_URL } from '$env/static/public';

export async function model_listup(): Promise<ModelInfo[]> {
	const response = await axios.get<ModelInfo[]>(`${PUBLIC_API_URL}/models`, { timeout: 5000 });
	return response.data;
}
