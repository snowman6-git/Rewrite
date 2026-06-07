import axios from 'axios';

const API_BASE = "http://localhost:8000";

// 1. Tokenize 호출 (문자열 -> 토큰 배열)
async function getTokenize(text: string) {
  try {
    const response = await axios.post(`http://localhost:8000/tokenize`, {
      model: "gemma-4-12b-it-UD-Q8_K_XL", //나중에 백에서 동적기입
      content: text,
      add_special: false
    });
    let tokens = response.data.tokens
    console.log(tokens.length)
    // return response.data.tokens; // 결과값: number[]
  } catch (error) {
    console.error("Tokenize 에러:", error);
  }
}
getTokenize("테스트용 문구들+++++++")

// 2. Detokenize 호출 (토큰 배열 -> 문자열)
// async function getDetokenize(tokenArray: number[]) {
//   try {
//     const response = await axios.post(`${API_BASE}/detokenize`, {
//       tokens: tokenArray   // 👈 필드명은 반드시 'tokens'여야 합니다.
//     });
//     return response.data.content; // 결과값: string
//   } catch (error) {
//     console.error("Detokenize 에러:", error);
//   }
// }
