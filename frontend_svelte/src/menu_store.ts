import { writable } from 'svelte/store';

export const isModel_menu_open = writable(false);
export const isModel_loaded = writable(false);

export const selectedModel: object = writable({
	id: 'Loading...',
	name: 'Loading...',
	desc: '모델 정보를 불러오는 중입니다...',
	hardware: '로딩중...',
	status: '로딩중...'
});
