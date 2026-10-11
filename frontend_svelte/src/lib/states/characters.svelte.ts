// 등장인물 선택 상태 — HamMenu 피커 + 채팅 페이로드 공유
// 목록 자체는 등장인물 섹션(sections/characters)이 소유. 여기는 선택 id만.

const LS_ACTIVE = 'rewrite_active_character';

function loadActive(): string {
	try {
		return localStorage.getItem(LS_ACTIVE) ?? '';
	} catch {
		return '';
	}
}

class CharactersMenuState {
	activeId = $state<string>(loadActive());

	select(id: string) {
		this.activeId = id;
		try {
			localStorage.setItem(LS_ACTIVE, id);
		} catch {
			// ignore
		}
	}
}

export const charactersMenu = new CharactersMenuState();
