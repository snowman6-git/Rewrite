const KEY = 'rewrite_showcase';

class ShowcaseState {
	on = $state(typeof window === 'undefined' ? false : localStorage.getItem(KEY) === '1');

	toggle() {
		this.on = !this.on;
		localStorage.setItem(KEY, this.on ? '1' : '0');
		return this.on;
	}

	/** 쇼케이스 모드 ON이면 표시 텍스트를 example로 바꾼다 */
	text(value: string) {
		return this.on ? 'example' : value;
	}
}

export const showcase = new ShowcaseState();
