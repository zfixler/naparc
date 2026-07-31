<script>
	import ClickOutside from './ClickOutside.svelte';

	/** @type {{settings?: any}} */
	let { settings = $bindable({}) } = $props();

	let shouldShowSettings = $state(false);
</script>

<button
	class="toggle"
	type="button"
	aria-label="Toggle settings"
	onclick={() => {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
		shouldShowSettings = !shouldShowSettings;
	}}>
	<svg
		class="js-click-outside-toggle"
		fill="currentColor"
		height="24px"
		viewBox="0 -960 960 960"
		width="24px"
		xmlns="http://www.w3.org/2000/svg"
		><path
			class="js-click-outside-toggle"
			d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z" /></svg>
</button>
{#if shouldShowSettings}
	<div class="wrapper">
		<ClickOutside bind:shouldShowContainer={shouldShowSettings}>
			<div class="container">
				<h2 class="title">Settings</h2>
				<main class="main">
					<section class="section">
						<h3 class="subtitle">Denominations</h3>
						{#each settings.included as denom (denom.slug)}
							<label class="label" for={denom.slug}>
								<input
									class="checkbox"
									id={denom.slug}
									type="checkbox"
									value={denom.slug}
									bind:checked={denom.checked} />
								{denom.abbr}
							</label>
						{/each}
					</section>
					<section class="section">
						<h3 class="subtitle">Radius</h3>
						<select class="select" name="radius" bind:value={settings.radius}>
							<option value="10">10 Miles</option>
							<option value="25">25 Miles</option>
							<option value="50">50 Miles</option>
						</select>
					</section>
					<button
						type="button"
						class="save"
						onclick={() => {
							shouldShowSettings = !shouldShowSettings;
							settings.hasSavedSettings = true;
						}}>Save Settings</button>
				</main>
			</div>
		</ClickOutside>
	</div>
{/if}

<style>
	.toggle {
		align-items: center;
		background: none;
		border: none;
		border-radius: var(--radius-pill);
		color: var(--muted);
		cursor: pointer;
		display: flex;
		height: 40px;
		justify-content: center;
		transition:
			color var(--speed) var(--ease),
			background-color var(--speed) var(--ease);
		width: 40px;
	}

	.toggle svg {
		height: 20px;
		width: 20px;
	}

	.toggle:hover,
	.toggle:focus-visible,
	.toggle:active {
		background-color: var(--accent-soft);
		color: var(--accent-strong);
	}

	.wrapper {
		display: flex;
		justify-content: center;
		left: 0;
		position: absolute;
		right: 0;
		top: calc(100% + var(--space-2xs));
		z-index: 1500;
	}

	.container {
		background-color: var(--bg-ff);
		border-radius: var(--radius-md);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-lg);
		color: var(--primary);
		padding: var(--space-md);
		width: 100%;
	}

	.main {
		column-gap: var(--space-lg);
		display: grid;
		grid-template-columns: 1fr 1fr;
		row-gap: var(--space-md);
	}

	.section {
		display: flex;
		flex-direction: column;
	}

	.title {
		color: var(--muted);
		font-family: var(--ff-body);
		font-size: var(--fs-micro);
		font-weight: var(--fw-semibold);
		letter-spacing: var(--tracking-wide);
		margin-bottom: var(--space-sm);
		text-transform: uppercase;
	}

	.subtitle {
		font-family: var(--ff-body);
		font-size: var(--fs-small);
		font-weight: var(--fw-semibold);
		letter-spacing: 0.01em;
		margin-bottom: var(--space-2xs);
	}

	.label,
	.checkbox {
		cursor: pointer;
	}

	.label {
		align-items: center;
		border-radius: var(--radius-xs);
		color: var(--secondary);
		display: flex;
		font-size: var(--fs-small);
		gap: var(--space-2xs);
		margin: 1px 0;
		padding: var(--space-3xs) var(--space-2xs) var(--space-3xs) 0;
		transition: color 120ms var(--ease);
		width: fit-content;
	}

	.label:hover {
		color: var(--primary);
	}

	.checkbox {
		accent-color: var(--accent);
		height: 16px;
		width: 16px;
	}

	.select {
		background-color: var(--bg-ff);
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-xs);
		color: var(--primary);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--fs-small);
		padding: var(--space-2xs) var(--space-xs);
		transition: border-color var(--speed) var(--ease);
	}

	.select:hover {
		border-color: var(--muted);
	}

	.save {
		background-color: var(--accent);
		border-radius: var(--radius-pill);
		border: none;
		box-shadow: var(--shadow-xs);
		color: var(--on-accent);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--fs-small);
		font-weight: var(--fw-semibold);
		grid-column: 2;
		justify-self: end;
		letter-spacing: 0.01em;
		padding: var(--space-2xs) var(--space-md);
		transition:
			background-color var(--speed) var(--ease),
			transform var(--speed) var(--ease),
			box-shadow var(--speed) var(--ease);
	}

	.save:focus-visible,
	.save:hover {
		background-color: var(--accent-strong);
		box-shadow: var(--shadow-sm);
		transform: translateY(-1px);
	}

	.save:active {
		transform: translateY(0);
	}

	@media (max-width: 480px) {
		.main {
			column-gap: var(--space-md);
		}
	}
</style>
