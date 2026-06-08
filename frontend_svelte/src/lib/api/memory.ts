import axios from 'axios';
import { PUBLIC_API_URL } from '$env/static/public';
import { modelsState } from '$lib/states/models.svelte';

export async function getTokenSize(text: string) {
	const token_size = await axios.post(
		`${PUBLIC_API_URL}/getToken_size`,
		{
			model: modelsState.selectedModel?.id,
			text: text
		},
		{}
	);
	return token_size.data;
}
