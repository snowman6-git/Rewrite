// 오버레이 = 히스토리 1entry: 뒤로가기(백버튼/웹 백)가 먼저 오버레이를 닫게 하는 표준 웹 패턴 (2026-10-27)
// onMount 시 호출 → 리턴된 cleanup이 언마운트 시 entry를 정리한다.
export function backEntry(onClose: () => void): () => void {
	let consumed = false;
	history.pushState({ backEntry: true }, '');
	function onPop() {
		consumed = true;
		onClose();
	}
	window.addEventListener('popstate', onPop);
	return () => {
		window.removeEventListener('popstate', onPop);
		// X/오버레이/Escape로 닫힌 경우 남긴 entry 회수 (백버튼으로 닫으면 이미 pop됨)
		if (!consumed) history.back();
	};
}
