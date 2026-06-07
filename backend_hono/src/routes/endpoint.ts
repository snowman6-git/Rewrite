import axios from "axios";
import * as dotenv from "dotenv";

// hono
import { Context } from "hono";
import { streamText } from "hono/streaming";

// 굳이 TS로 해야할지 고민하기
import { MODEL_DISPLAY_CONFIG } from "../static/model";

import { add_chat_history, load_chat_history, reset_chat_history } from "./session";
import { getTokenLength } from "./api/memory_manager";

dotenv.config();
const LLM_API_URL = process.env.LLM_API_URL;
const API_KEY = process.env.API_KEY;

interface ModelInfo {
  id: string;
  status?: {
    value: string;
  };
}

interface ChatInfo {
  sender: string;
  content: string;
}

// 차후 세션의 분리와 함께 해당 함수의 세션 분간용 인자를 통해 수정
export async function chat_listup(c: Context) {
  let loaded_chat_history = await load_chat_history()
  const chat_list = loaded_chat_history.slice(2).map((chat: ChatInfo) => {
  return {
    // 테스트를 위해 임시 생성, 프/백 둘다 다른값으로 계속 생성중이니 알고 있을것
    id: crypto.randomUUID(),
    ...chat,
  };
  });

  return c.json(chat_list)
}

export async function getTokenSize(c: Context) {
  try {
    const { model, text } = await c.req.json();
    const response = await axios.post(`${LLM_API_URL}/tokenize`, {
      model: model, //나중에 백에서 동적기입
      content: text,
      add_special: false
    });
    return response.data.tokens
  } catch (error) {
    console.error("Tokenize 에러:", error);
  }
}  

export async function world_memory(c: Context) {
  let memory = await load_chat_history()
  memory = memory.slice(2) // 1. 특정 인덱스(3) 이후만 잘라냄
  .map(memory => ({
    role: memory.role,
    content: memory.content,
  }));
  return c.json(memory);
}

export async function reset_world_memory(c: Context) {
  await reset_chat_history(); //나중엔 성공여부도 확인
  return c.json({ message: "World memory reset successfully" });
}

export async function models(c: Context) {
  let models_api = await axios.get(`${LLM_API_URL}/models`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });
  let models_api_data = models_api.data.data;
  const chat_list = models_api_data.map((model: ModelInfo) => {
  // 1. 매핑 테이블에서 해당 모델용 정보를 가져옴
  const config = MODEL_DISPLAY_CONFIG[model.id];
  // 2. 새로운 객체를 반환 (이게 포인트!)
  return {
    // ...model, // 기존에 있던 id, created 등 모든 필드를 복사 < 가는게 너무 많음
    id: model.id, // 모델명은 기존 id로 설정
    name: config?.aliases ?? model.id,
    desc: config?.desc ?? "설명 없음",
    status: model.status?.value ?? "알 수 없음", // 메모리에 올라왔는가, 안나오는 경우도 있으니 status?넣어서 후처리
    hardware: config?.hardware ?? "권장사양없음"
  };
  });
  return c.json(chat_list);
}

export async function chat(c: Context) {
  const { id, chat, model, custom_note, logic_plus } = await c.req.json();
  // 초기화 하고 리턴에서 참조가능하게 상위변수 지정
  let thinking_tokens = 0
  if (logic_plus == false) {
    thinking_tokens = 0;
  } else {
    thinking_tokens = 560;
  }
  // 유저입력을 추가
  await add_chat_history(id, "user", chat);
  const requestBody = {
    model: model,
    // Advance parameters
    min_p: 0.5,
    temperature: 1.2,
    // token
    max_tokens: 2000,
    thinking_budget_tokens: thinking_tokens,
    // streaming
    stream: true, // 반드시 true로 설정
    is_input: true,
    // 채팅기록을 불러옴, 이때 방금 막 추가한 메세지도 불러와 사용됌
    messages: await load_chat_history()
  };

  const response = await fetch(`${LLM_API_URL}/v1/chat/completions`, { // 엔드포인트 확인
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
    body: JSON.stringify(requestBody),
  })


  let llm_response_result = "";
  return streamText(c, async (stream) => {
    const reader = response.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n')) {
        const jsonStr = line.slice(6); //6개로 썰어야 시작종료 태그가 된다고 함
        
        if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
          const data = JSON.parse(jsonStr);
          if (data.choices[0]?.finish_reason === 'stop') {
            // let reasponse_info = {
            //   tps: data.timings.predicted_per_second,
            //   start_in: data.timings.predicted_ms,
            // }
            // await stream.write(``);
          } else {
            const content = data.choices[0]?.delta?.content || '';
            llm_response_result += content;
            await stream.write(content);
          }
        }
      }
    }
    // 스트림데이터 수신 종료후, LLM의 최종응답을 저장
    await add_chat_history(id, "assistant", llm_response_result);
  });
}