<script lang="ts">
	import '$lib/assets/chat_body.css';

	//공통 중립 서피스(모두 동일) + 엑센트만 다른 5종
	type Palette = { name: string; vars: Record<string, string> };

	const base = {
		'--color-bg-primary': '#0a0a0a',
		'--color-bg-secondary': '#111111',
		'--color-bg-tertiary': '#1a1a1a',
		'--color-bg-elevated': '#222222',
		'--color-bg-hover': '#2a2a2a',
		'--color-text-primary': '#ededed',
		'--color-text-secondary': '#a0a0a0',
		'--color-text-tertiary': '#666666',
		'--color-border': '#2a2a2a',
		'--color-code-bg': '#161616',
		'--color-code-border': '#2a2a2a',
		'--color-code-header-bg': '#111111',
		'--color-code-text': 'rgba(255,255,255,0.75)'
	};

	const palettes: Palette[] = [
		{
			name: 'N1 · indigo 유지',
			vars: {
				...base,
				'--color-accent-primary': '#6366f1',
				'--color-accent-secondary': '#8b5cf6',
				'--color-accent-gradient': 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)',
				'--color-accent-glow': 'rgba(99,102,241,0.15)'
			}
		},
		{
			name: 'N2 · emerald',
			vars: {
				...base,
				'--color-accent-primary': '#10b981',
				'--color-accent-secondary': '#34d399',
				'--color-accent-gradient': 'linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%)',
				'--color-accent-glow': 'rgba(16,185,129,0.15)'
			}
		},
		{
			name: 'N3 · amber',
			vars: {
				...base,
				'--color-accent-primary': '#f59e0b',
				'--color-accent-secondary': '#fbbf24',
				'--color-accent-gradient': 'linear-gradient(135deg,#d97706 0%,#f59e0b 50%,#fbbf24 100%)',
				'--color-accent-glow': 'rgba(245,158,11,0.15)'
			}
		},
		{
			name: 'N4 · rose',
			vars: {
				...base,
				'--color-accent-primary': '#f43f5e',
				'--color-accent-secondary': '#fb7185',
				'--color-accent-gradient': 'linear-gradient(135deg,#e11d48 0%,#f43f5e 50%,#fb7185 100%)',
				'--color-accent-glow': 'rgba(244,63,94,0.15)'
			}
		},
		{
			name: 'N5 · 모노크롬',
			vars: {
				...base,
				'--color-accent-primary': '#ededed',
				'--color-accent-secondary': '#a0a0a0',
				'--color-accent-gradient': 'linear-gradient(135deg,#ededed 0%,#a0a0a0 100%)',
				'--color-accent-glow': 'rgba(255,255,255,0.10)'
			}
		}
	];
</script>

<div class="gallery">
	{#each palettes as p (p.name)}
		<section class="panel" style={Object.entries(p.vars).map(([k, v]) => `${k}:${v}`).join(';')}>
			<h2 class="panel-name">{p.name}</h2>

			<button class="chip">◈ Gemini 3.5 Flash-Lite</button>

			<div class="message-row user">
				<div class="message-bubble user markdown-content">
					example
				</div>
			</div>

			<div class="message-row assistant">
				<div class="message-bubble assistant">
					<div class="markdown-content">
						example text with <code>inline</code> code.
						<pre><code>example = "example"</code></pre>
					</div>
					<div class="bubble-actions">
						<span class="action-btn" style="width:16px;height:16px"></span>
						<span class="action-btn" style="width:16px;height:16px"></span>
					</div>
				</div>
			</div>

			<div class="row">
				<button class="btn-primary">example</button>
				<button class="btn-ghost">example</button>
				<span class="grad-bar"></span>
			</div>
		</section>
	{/each}
</div>

<style>
	.gallery {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-md);
		min-height: 100vh;
	}

	.panel {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: var(--space-md);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}

	.panel-name {
		margin: 0;
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.chip {
		align-self: flex-end;
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-accent-primary);
		border-radius: 999px;
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
	}

	.bubble-actions {
		display: flex;
		gap: 2px;
		margin-top: auto;
	}

	.row {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.btn-primary {
		padding: var(--space-xs) var(--space-md);
		border: none;
		border-radius: var(--radius-sm);
		background: var(--color-accent-primary);
		color: #0a0a0a;
		font-size: var(--font-size-sm);
		cursor: pointer;
	}

	.btn-ghost {
		padding: var(--space-xs) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		cursor: pointer;
	}

	.grad-bar {
		width: 80px;
		height: 8px;
		border-radius: 4px;
		background: var(--color-accent-gradient);
	}
</style>
