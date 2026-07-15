<script lang="ts">
	import { toast } from '$lib/stores/toast.svelte';
	import ToastContainer from '$components/Common/ToastContainer.svelte';
	import InputField from '$components/Common/InputField.svelte';
	import Btn from '$components/Common/Btn.svelte';

	let id = $state('');
	let password = $state('');
	let isLoading = $state(false);

	async function handleLogin() {
		if (!id || !password) {
			toast.warning('아이디와 비밀번호를 입력해주세요');
			return;
		}

		isLoading = true;
		
		try {
			const response = await fetch('http://localhost:3002/api/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id, password })
			});

			if (response.ok) {
				const data = await response.json();
				toast.success('로그인 성공!');
				// TODO: 토큰 저장, 리다이렉트
			} else {
				toast.error('로그인 실패!');
			}
		} catch (error) {
			toast.error('로그인 실패!');
		} finally {
			isLoading = false;
		}
	}
</script>

<main class="login-page" aria-label="로그인 페이지">
	<ToastContainer />
	<div class="login-container">
		<!-- Logo Section -->
		<div class="logo-section">
			<img src="/logos/rewrite.svg" alt="Rewrite Logo" class="logo-svg" />
			<h1 class="logo-text">Rewrite</h1>
			<p class="subtitle">
				마침표를 지우고,<br />
				<span class="highlight">다시</span> 써내려갈 당신만의 이야기.
			</p>
		</div>

		<!-- Login Form -->
		<form class="login-form" onsubmit={handleLogin} aria-label="로그인 폼">
			<div class="input-group">
				<label for="login-id" class="sr-only">아이디</label>
				<InputField 
					id="login-id"
					type="text" 
					bind:value={id} 
					placeholder="아이디를 입력하세요"
				/>
			</div>

			<div class="input-group">
				<label for="login-password" class="sr-only">비밀번호</label>
				<input 
					id="login-password"
					type="password"
					bind:value={password}
					placeholder="비밀번호를 입력하세요"
					class="input-field password-input"
					aria-label="로그인 비밀번호"
				/>
			</div>

			<div class="input-group login-btn-group">
				<Btn 
					variant="save" 
					onclick={handleLogin}
					disabled={isLoading || !id || !password}
				>
					{#if isLoading}
						<span>로그인 중...</span>
					{:else}
						<span>로그인</span>
					{/if}
				</Btn>
			</div>
		</form>

		<!-- Footer -->
		<footer class="login-footer">
			<p>&copy; 2026 Rewrite AI. All rights reserved.</p>
		</footer>
	</div>
</main>

<style>
	.login-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: var(--color-bg-primary);
	}
	.highlight {
		color: var(--color-accent-primary);
		font-weight: 600;
	}
	/* Container */
	.login-container {
		width: 100%;
		max-width: 420px;
		padding: var(--space-md);
		background: var(--color-bg-secondary);
		border: 0.15rem solid var(--color-accent-primary);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		backdrop-filter: blur(10px);
	}

	/* Logo Section */
	.logo-section {
		text-align: center;
		margin-bottom: 0;
	}

	.logo-svg {
		width: 120px;
		height: auto;
		margin-bottom: 0.25rem;
	}

	.logo-text {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		background: var(--color-accent-gradient);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: var(--space-xs);
		letter-spacing: -0.02em;
	}

	.subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
		line-height: 1.6;
		margin-bottom: var(--space-lg);
	}

	/* Form */
	.login-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.input-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.password-input {
		width: 100%;
		padding: var(--space-sm) var(--space-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		font-family: var(--font-family);
		font-size: var(--font-size-sm);
		outline: none;
		transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
		box-sizing: border-box;
	}

	.password-input:focus {
		border-color: var(--color-accent-primary);
		box-shadow: 0 0 0 2px var(--color-accent-glow);
	}

	.password-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.login-btn-group {
		margin-top: var(--space-sm);
	}

	/* Footer */
	.login-footer {
		margin-top: var(--space-2xl);
		text-align: center;
	}

	.login-footer p {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		opacity: 0.7;
	}

	/* Responsive - Mobile Full Screen */
	@media (max-width: 640px) {
		.login-container {
			width: 100%;
			max-width: none;
			margin: 0;
			padding: var(--space-lg);
			border-radius: 0;
			border: none;
			min-height: 100vh;
			display: flex;
			flex-direction: column;
			justify-content: center;
		}

		.logo-svg {
			width: 100px;
		}

		.logo-text {
			font-size: var(--font-size-2xl);
		}

		.subtitle {
			font-size: var(--font-size-xs);
		}
	}

	@media (max-width: 480px) {
		.login-container {
			padding: var(--space-md);
		}

		.logo-svg {
			width: 80px;
		}
	}
</style>
