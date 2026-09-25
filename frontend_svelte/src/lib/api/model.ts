import axios from 'axios';
import type { ModelInfo } from '$lib/types';
import { apiBase } from '$api/client';

export async function model_listup(): Promise<ModelInfo[]> {
	const response = await axios.get<ModelInfo[]>(`${apiBase()}/models`, { timeout: 5000 });
	return response.data;
}
