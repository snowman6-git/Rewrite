// 책 목록의 컨텍스트메뉴(우클릭) + 모바일 롱프레스 + 삭제 확인 상태.
// book/Section과 library/LibrarySection이 같은 구현을 각각 복제하고 있었다.
import { longPress } from '$lib/longpress';

export function useBookMenu<T extends { id: string }>() {
	const menu = $state<{ x: number; y: number; book: T | null; lp: T | null; confirm: T | null }>({
		x: 0,
		y: 0,
		book: null,
		lp: null,
		confirm: null
	});

	function open(x: number, y: number, book: T) {
		menu.x = x;
		menu.y = y;
		menu.book = book;
	}

	function hide() {
		menu.x = 0;
		menu.y = 0;
		menu.book = null;
	}

	function show(e: MouseEvent, book: T) {
		e.preventDefault();
		e.stopPropagation();
		open(e.clientX, e.clientY, book);
	}

	// 데스크톱 우클릭과 쌍 — 터치에서 contextmenu 이벤트가 안 뜨는 플랫폼 대응
	const lp = longPress((x, y) => {
		if (menu.lp) open(x, y, menu.lp);
	});

	return { menu, open, hide, show, lp };
}
