import axios from "axios";
import * as dotenv from "dotenv";

// hono
import { Context } from "hono";
import { streamText } from "hono/streaming";

// 굳이 TS로 해야할지 고민하기
import { MODEL_DISPLAY_CONFIG } from "../static/model";

import { ModelInfo, ChatInfo } from "../types/index"

import { add_chat_history, load_chat_history, reset_chat_history } from "./session";
import { args_only } from "../lib/parser";
import { memo } from "hono/jsx";
import { system_prompt } from "../api/session";



dotenv.config();
const LLM_API_URL = process.env.LLM_API_URL;
const API_KEY = process.env.API_KEY;

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

// 지금은 백에서 컨택윈도를 얼마나 차지하는 용도로 쓸 것, 차후 프론트에서 텍스트를 주고 받는 식을 사용할지 고민(일단 오버헤드 생각해서 정적 분석만)
export async function getTokenSize(c: Context) {
  const { model } = await c.req.json();
  let text: string = "";
  try {
    const target = c.req.param("target");
    switch (target) {
      case "memory": {
        let memory = await load_chat_history()
        for (let content of memory) {
          text += content['content'];
        }
      }
    }
    const response = await axios.post(`${LLM_API_URL}/tokenize`, {
      // 문제가 생김, 우린 기본적으로 시작시 모델이 로드가 안돼있는데, 그럼 백에서 '로드된 모델' 로 토크나이징 할 수 없음
      // 1. 스타팅시 아무모델이나 로드하고 시작하거나
      // 2. 선호모델저장을 해서, 매 시작마다 폴더 서빙을 하더라도 로드를 하거나
      model: model, //나중에 백에서 동적기입
      content: text,
      add_special: false
    });
    let tokens = response.data.tokens
    
    // 돌아온 텍스트 -> 토큰의 길이 구해 int만 넘기기
    return c.text(tokens.length)
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

// 이걸 대체 왜 다른데 빼서 따로 만들었더라...? 바로 수정.
export async function world_edit(c: Context) {
  return c.text(`${system_prompt}`);
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
    hardware: config?.hardware ?? "권장사양없음",
    context_size: args_only(model.status?.args)
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
    // 누적토큰값 나오는게 있는듯, 이걸로 통합 ㄱ
    return_progress: true,
    timings_per_token: true,
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
          } else {
            const content = data.choices[0]?.delta?.content || '';
            llm_response_result += content;

            const res = {
              content: content,
              input: data["timings"]["prompt_n"],
              output: data["timings"]["predicted_n"]
            }

            await stream.write(JSON.stringify(res) + "\n");
          }
        }
      }
    }

    // 스트림데이터 수신 종료후, LLM의 최종응답을 저장
    await add_chat_history(id, "assistant", llm_response_result);
  });
}