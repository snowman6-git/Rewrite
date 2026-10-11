import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { longPress } from './longpress';

const touch = (x: number, y: number) =>
	({ touches: [{ clientX: x, clientY: y }], preventDefault: vi.fn() }) as unknown;

describe('longPress', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('450ms 후 한 번 발화하고 consume으로 소비한다', () => {
		const onFire = vi.fn();
		const lp = longPress(onFire);
		lp.ontouchstart(touch(10, 10) as TouchEvent);
		vi.advanceTimersByTime(449);
		expect(onFire).not.toHaveBeenCalled();
		vi.advanceTimersByTime(2);
		expect(onFire).toHaveBeenCalledWith(10, 10);
		expect(lp.consume()).toBe(true);
		expect(lp.consume()).toBe(false);
	});

	it('12px 이상 밀리면 취소된다 (스크롤과 구별)', () => {
		const onFire = vi.fn();
		const lp = longPress(onFire);
		lp.ontouchstart(touch(10, 10) as TouchEvent);
		lp.ontouchmove(touch(10, 23) as TouchEvent);
		vi.advanceTimersByTime(500);
		expect(onFire).not.toHaveBeenCalled();
	});

	it('터치 종료 후 합성 클릭을 억제한다', () => {
		const lp = longPress(vi.fn());
		lp.ontouchstart(touch(1, 1) as TouchEvent);
		vi.advanceTimersByTime(500);
		const end = touch(1, 1) as TouchEvent;
		lp.ontouchend(end);
		expect(end.preventDefault as ReturnType<typeof vi.fn>).toHaveBeenCalled();
	});
});
