import axios from 'axios';
import * as dotenv from 'dotenv';

// hono
import { Context } from 'hono';
import { streamText } from 'hono/streaming';

// 굳이 TS로 해야할지 고민하기
import { MODEL_DISPLAY_CONFIG } from '../lib/models';

import { ModelInfo, ChatInfo } from '../types/index';

import { args_only } from '../lib/parser';
import { memo } from 'hono/jsx';
import { add_chat_history, reset_chat_history } from '../services/session';
import { ReadBook } from '../lib/db';
import { Gemini_chat, Gemini_models } from '../test/Gemini-api';
import { EditBook } from '../lib/edit';

dotenv.config();
const LLM_API_URL = process.env.LLM_API_URL;
const API_KEY = process.env.API_KEY;

// 차후 세션의 분리와 함께 해당 함수의 세션 분간용 인자를 통해 수정
export async function chat_listup(c: Context) {
	const { book_id } = c.req.query();
	// 화면은 캐시 에포크 윈도우가 아니라 "최근 50개"를 본다 (X-Total-Count: 전체 행 수)
	const chat_list = ReadBook.chatRecent(`${book_id}`);
	c.header('X-Total-Count', String(ReadBook.chatCount(`${book_id}`)));
	return c.json(chat_list);
}

// GET하나 UPDATE하나 해서 보기만 하기 업데이트하기 이런거 추가
export async function world_edit(c: Context) {
	const { book_id } = c.req.query();
	let system = ReadBook.system(book_id);
	return c.text(system);
}
export async function update_world_edit(c: Context) {
	const { book_id, prompt } = await c.req.json();
	if (EditBook.system(book_id, prompt)) {
		c.status(200);
		return c.json({ status: 'ok' });
	} else {
		c.status(404);
		return c.json({ status: 'ok' });
	}
}

export async function models(c: Context) {
	let models_api_data = await Gemini_models();
	return c.json(models_api_data);
}

export async function chat(c: Context) {
	const { book_id, chat, model, custom_note, logic_plus } = await c.req.json();
	// 초기화 하고 리턴에서 참조가능하게 상위변수 지정
	let thinking_tokens = 0;
	if (logic_plus == false) {
		thinking_tokens = 0;
	} else {
		thinking_tokens = 1024;
	}
	// 유저입력을 추가 이거 응답 정상적으로 오는지, 디비에 저장은 됐는지 DB연동, API체크, SSE적용할것
	await add_chat_history(book_id, 'user', chat);
	const requestBody = {
		model: model.id,
		temperature: 1.2,
		max_tokens: 5500,
		thinking_budget_tokens: thinking_tokens,
		stream: true,
		is_input: true,
		// 누적토큰값 나오는게 있는듯, 이걸로 통합 ㄱ
		return_progress: true,
		timings_per_token: true,
		// 채팅기록을 불러옴, 이때 방금 막 추가한 메세지도 불러와 사용됌
		header: ReadBook.header(book_id),
		messages: ReadBook.chatContext(book_id),
	};
	// 일단은 provider구분 없이, 나중엔 꼭해야함!!
	if (model.provider == 'gemini') {
		let llm_response_result = '';
		let usage: any;
		const response = (await Gemini_chat(requestBody)) as AsyncGenerator<any>;
		return streamText(c, async (stream) => {
			for await (const chunk of response) {
				try {
					// 이게 최선인지 알아보기
					const content = chunk.text;
					if (chunk.usageMetadata) usage = chunk.usageMetadata;
					if (content != undefined) {
						const res = {
							content: content,
						};
						await stream.write(JSON.stringify(res) + '\n');
						llm_response_result += content;
					}
				} catch (error) {
					console.log(error);
				}
			}
			console.log(
				'[cache] cached:',
				usage?.cachedContentTokenCount ?? 0,
				'/',
				usage?.promptTokenCount ?? 0,
			);
			// 응답 종료시 메세지 묶어서 저장
			await add_chat_history(book_id, 'assistant', llm_response_result);
		});
	} else {
	}
}
