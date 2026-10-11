class PageState {
	isModel_menu_open = $state<boolean>(false);
	// 햄메뉴 개방 상태 — 책갈피 점프처럼 뷰 밖에서 닫아야 할 요청이 생긴다
	isHammenu_open = $state<boolean>(false);
}
export const pageState = new PageState();
