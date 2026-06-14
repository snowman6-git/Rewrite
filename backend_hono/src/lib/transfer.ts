import axios from 'axios';
import * as dotenv from "dotenv";

dotenv.config();
const LLM_API_URL = process.env.LLM_API_URL;

// 토크나이저를 통해, 해당 텍스트의 크기 구하기
export async function getTokenSize(text: string) {
	const token_size = await axios.post(
		`${LLM_API_URL}/getToken_size`,
		{
			model: modelsState.selectedModel?.id,
			text: text
		},
		{}
	);
	return token_size.data;
}