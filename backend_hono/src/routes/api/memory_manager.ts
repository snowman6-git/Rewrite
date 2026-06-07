import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();
const LLM_API_URL = process.env.LLM_API_URL;

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