// 잉크 화폐. API 연동 전까지 임시 고정값.
import { tuningState } from './tuning.svelte';

// 추론 깊이별 배율: 없음=0, 낮음=1, 중간=2, 높음=4
const DEPTH_COST_FACTOR = [0, 1, 2, 4];

export class InkState {
	// TODO: 잔액 API
	balance = $state(1337);
	// 사용 내역 (소모 이벤트) — 당장 없음
	usage = $state<{ label: string; amount: number }[]>([]);

	// 1회 예상 소모량 = 출력 한도(토큰) × 깊이 배율
	// TODO: 모델당 토큰 소모율(model data) 연동 시 곱셈 추가
	get costPerUse() {
		const factor = DEPTH_COST_FACTOR[tuningState.reasoningDepth] ?? 0;
		return tuningState.maxOutputTokens * factor;
	}

	// 예상 사용 횟수. 소모 0이면 null (∞ 표시)
	get estimatedUses() {
		return this.costPerUse > 0 ? Math.floor(this.balance / this.costPerUse) : null;
	}
}

export const inkState = new InkState();
