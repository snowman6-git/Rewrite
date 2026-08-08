<script lang="ts">
	let {
		label,
		description = '',
		type = 'toggle',
		value = false,
		options = []
	}: {
		label: string;
		description?: string;
		type: 'toggle' | 'select';
		value?: boolean | string;
		options?: string[];
	} = $props();
</script>

<div class="setting-item">
	<div class="setting-info">
		<span class="setting-label">{label}</span>
		{#if description}
			<span class="setting-description">{description}</span>
		{/if}
	</div>
	{#if type === 'toggle'}
		<label class="toggle-switch">
			<input type="checkbox" checked={typeof value === 'boolean' ? value : false} />
			<span class="toggle-slider"></span>
		</label>
	{:else}
		<select class="setting-select">
			{#each options as option (option)}
				<option>{option}</option>
			{/each}
		</select>
	{/if}
</div>

<style>
	.setting-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-lg);
		border-radius: var(--radius-lg);
		background: var(--color-bg-tertiary);
		gap: var(--space-lg);
		transition: all var(--transition-base);
	}

	.setting-item:hover {
		background: var(--color-bg-elevated);
	}

	.setting-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
		min-width: 0;
	}

	.setting-label {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1.4;
	}

	.setting-description {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.toggle-switch {
		position: relative;
		display: inline-block;
		width: 48px;
		height: 26px;
		flex-shrink: 0;
	}

	.toggle-switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--color-bg-elevated);
		transition: 0.3s;
		border-radius: 26px;
	}

	.toggle-slider:before {
		position: absolute;
		content: '';
		height: 20px;
		width: 20px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: 0.3s;
		border-radius: 50%;
	}

	input:checked + .toggle-slider {
		background-color: var(--color-accent-primary);
	}

	input:checked + .toggle-slider:before {
		transform: translateX(22px);
	}

	.setting-select {
		padding: var(--space-sm) var(--space-md);
		border: none;
		border-radius: var(--radius-md);
		background: var(--color-bg-elevated);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		font-weight: 500;
		flex-shrink: 0;
		cursor: pointer;
		transition: all var(--transition-base);
		margin-left: var(--space-md);
	}

	.setting-select:hover {
		background: var(--color-bg-primary);
	}

	.setting-select:focus {
		outline: 2px solid var(--color-accent-primary);
		outline-offset: 2px;
	}

	@media (max-width: 768px) {
		.setting-item {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-md);
		}

		.toggle-switch,
		.setting-select {
			align-self: flex-end;
		}
	}

	@media (max-width: 480px) {
		.setting-item {
			padding: var(--space-md);
		}

		.setting-label {
			font-size: var(--font-size-base);
		}

		.setting-description {
			font-size: var(--font-size-sm);
		}

		.toggle-switch {
			width: 44px;
			height: 24px;
		}

		.toggle-slider:before {
			height: 18px;
			width: 18px;
			left: 3px;
			bottom: 3px;
		}

		input:checked + .toggle-slider:before {
			transform: translateX(20px);
		}
	}
</style>
