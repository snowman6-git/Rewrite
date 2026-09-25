<script lang="ts">
	import { tuningState } from '$lib/states/tuning.svelte';

	const depthLabels = ['없음', '낮음', '중간', '높음'];
	const outputSteps = [512, 1024, 2048, 4096, 8192, 16384, 32768];
	const outputMul = outputSteps.map((v) => `×${v / 512}`);
	const outputIndex = $derived(outputSteps.indexOf(tuningState.maxOutputTokens));
</script>

<div class="tuning">
	<div class="tuning-card">
		<section class="tuning-block">
			<div class="block-head">
				<h3 class="block-title">추론 깊이</h3>
				<span class="block-value">{depthLabels[tuningState.reasoningDepth]}</span>
			</div>
			<p class="block-desc">모델의 논리적 판단이 강해지지만, 더 많은 잉크와 시간을 사용해요, </p>
			<input
				type="range"
				class="tuning-range"
				min={0}
				max={3}
				step={1}
				bind:value={tuningState.reasoningDepth}
				aria-label="추론 깊이"
			/>
			<div class="ticks" aria-hidden="true">
				{#each depthLabels as label (label)}
					<span>{label}</span>
				{/each}
			</div>
		</section>

		<div class="block-divider" role="presentation"></div>

		<section class="tuning-block">
			<div class="block-head">
				<h3 class="block-title">출력 한도</h3>
				<span class="block-value">{tuningState.maxOutputTokens.toLocaleString()} tok</span>
			</div>
			<p class="block-desc">한번 출력하는 토큰의 양이에요, 클수록 많은 잉크를 사용해요</p>
			<input
				type="range"
				class="tuning-range"
				min={0}
				max={6}
				step={1}
				value={outputIndex === -1 ? 3 : outputIndex}
				oninput={(e) => (tuningState.maxOutputTokens = outputSteps[+e.currentTarget.value])}
				aria-label="출력 한도"
			/>
			<div class="ticks" aria-hidden="true">
				{#each outputMul as mul (mul)}
					<span>{mul}</span>
				{/each}
			</div>
		</section>
	</div>
</div>

<style>
	.tuning {
		display: flex;
		flex-direction: column;
		margin-top: var(--space-xs);
	}

	.tuning-card {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.tuning-block {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: var(--space-sm) var(--space-md);
	}

	.block-divider {
		height: 1px;
		background: var(--color-border);
	}

	.block-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: var(--space-xs);
	}

	.block-title {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.block-value {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		font-variant-numeric: tabular-nums;
	}

	.block-desc {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		line-height: 1.5;
		margin: 0 0 var(--space-xs);
	}

	.tuning-range {
		width: 100%;
		margin: var(--space-xs) 0;
		accent-color: var(--color-text-secondary);
	}

	.ticks {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		padding: 0 8px; /* 썸 절반 폭 — 슬라이더 움직임 범위와 정렬 */
	}
</style>
