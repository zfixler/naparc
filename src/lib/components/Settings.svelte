<script>
	import ClickOutside from './ClickOutside.svelte';

	export let settings = {};

	/** @type {Array<import("@prisma/client").Denomination>} */
	export let denominations;

	settings.included = denominations.map(({ slug, name: abbr }) => {
		return {
			abbr,
			slug,
			checked: true,
		};
	});

	settings.radius = 25;

	let shouldShowSettings = false;
</script>

<button
	class="toggle"
	type="button"
	on:click={() => {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
		shouldShowSettings = !shouldShowSettings;
	}}
>
	<svg
		class="js-click-outside-toggle"
		fill="currentColor"
		height="24px"
		viewBox="0 -960 960 960"
		width="24px"
		xmlns="http://www.w3.org/2000/svg"
		><path
			class="js-click-outside-toggle"
			d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z"
		/></svg
	>
</button>
{#if shouldShowSettings}
	<ClickOutside bind:shouldShowContainer={shouldShowSettings}>
		<div class="container">
			<h2 class="title">Settings</h2>
			<main class="main">
				<section class="section">
					<h3 class="subtitle">Denominations</h3>
					{#each settings.included as denom}
						<label
							class="label"
							for={denom.slug}
						>
							<input
								class="checkbox"
								id={denom.slug}
								type="checkbox"
								value={denom.slug}
								bind:checked={denom.checked}
							/>
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
				<button type="button" class="save">Save Settings</button>
			</main>
		</div>
	</ClickOutside>
{/if}

<style>
	.toggle {
		background: none;
		border: none;
		color: var(--gray-3);
		cursor: pointer;
		outline: none;
		transition: color 0.25s ease;
	}

	.toggle:hover,
	.toggle:focus,
	.toggle:active {
		color: var(--accent);
	}

	.container {
		background-color: var(--bg-ff);
		border-radius: var(--brad);
		color: var(--primary);
		left: 0;
		left: 32px;
		padding: 18px;
		position: absolute;
		right: 32px;
		top: 135px;
	}

	.main {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.section {
		display: flex;
		flex-direction: column;
	}

	.title {
		margin-bottom: 8px;
		height: 100%;
	}

	.subtitle {
		font-size: var(--fs-h4);
		margin-bottom: 8px;
	}

	.label,
	.checkbox {
		cursor: pointer;
	}

	.label {
		width: fit-content;
	}

	.select {
		padding: 4px 6px;
		border-radius: var(--brad);
		font-family: inherit;
		cursor: pointer;
	}

	.save {
		background-color: var(--blue-2);
		border-radius: var(--brad);
		border: none;
		box-shadow: var(--box-shadow);
		color: #FFF;
		cursor: pointer;
		font-family: inherit;
		font-weight: bold;
		grid-column: 2;
		justify-self: end;
		letter-spacing: 1px;		
		padding: 8px 16px;
		transition: background-color ease .25s;
	}

	.save:focus,
	.save:hover {
		background-color: var(--accent);
	}
</style>
