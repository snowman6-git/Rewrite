import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();
const LLM_API_URL = process.env.LLM_API_URL;
// 이거 어차피 v1 호출하고나면 useage에 누적 량이 온다고는함, 수동으로 굳이 만들 필요 있을까?
export async function getTokenLength(text: string, model: string) {
  try {
    const response = await axios.post(`${LLM_API_URL}}/tokenize`, {
      model: model,
      content: text,
      add_special: false
    });
    return response.data.tokens.length;
  } catch (error) {
    console.error("Tokenize 에러:", error);
  }
}