// 모바일 롱프레스(터치 꾹) 감지. 데스크톱 우클릭과 쌍으로 사용.
const DELAY = 450;
const SWIPE_TOL = 12;

export interface LongPress {
	ontouchstart(e: TouchEvent): void;
	ontouchmove(e: TouchEvent): void;
	ontouchend(e: TouchEvent): void;
	ontouchcancel(): void;
	/** 롱프레스가 발화됐으면 true(소비). 클릭 핸들러에서 확인해 동작 억제 */
	consume(): boolean;
}

export function longPress(onFire: (x: number, y: number) => void): LongPress {
	let timer: ReturnType<typeof setTimeout> | null = null;
	let sx = 0;
	let sy = 0;
	let fired = false;

	function clear() {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	}

	return {
		ontouchstart(e: TouchEvent) {
			if (e.touches.length !== 1) return;
			fired = false;
			sx = e.touches[0].clientX;
			sy = e.touches[0].clientY;
			clear();
			timer = setTimeout(() => {
				fired = true;
				timer = null;
				onFire(sx, sy);
			}, DELAY);
		},
		ontouchmove(e: TouchEvent) {
			if (!timer) return;
			const t = e.touches[0];
			if (Math.hypot(t.clientX - sx, t.clientY - sy) > SWIPE_TOL) clear();
		},
		ontouchend(e: TouchEvent) {
			clear();
			if (fired) {
				// 합성 click 억제
				e.preventDefault();
			}
		},
		ontouchcancel() {
			clear();
		},
		consume() {
			const f = fired;
			fired = false;
			return f;
		}
	};
}
