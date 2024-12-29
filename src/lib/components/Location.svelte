<script>
	import { ClickOutside } from '$lib/components';
	import { slide } from 'svelte/transition';

	/** @type {{results: any, options: any, shouldShowMenu: boolean}} */
	let { results = $bindable(), options = $bindable(), shouldShowMenu = $bindable() } = $props();
	let selectedLabel = $state('');

	/** @type {NodeJS.Timeout|number|undefined} */
	let debounceTimer;
	/**
	 * @type {AbortController | null}
	 */
	let currentRequest;
	/** @type {Array<OptionObject>}*/

	/**
	 * @typedef {Object} ResultObject
	 * @property {string} formatted - Formatted location name
	 * @property {number} lon - Location longitude
	 * @property {number} lat - Location latitude
	 * @property {string} place_id - Unique identifier
	 */

	/**
	 * @typedef {Object} OptionObject
	 * @property {string} id - Unique identifier
	 * @property {object} body - Option body
	 * @property {number} body.lon - Location longitude
	 * @property {number} body.lat - Location latitude
	 * @property {string} body.label - Formatted location
	 */

	/**
	 * Format menu options from API data
	 * @param {Object} data
	 * @param {Array<ResultObject>} data.results
	 */
	function formatOptions({ results }) {
		return results.map(({ formatted: label, lat, lon, place_id }) => {
			const body = {
				lat,
				lon,
				label,
			};
			return { id: place_id, body };
		});
	}

	/**
	 * Fetch locations from API on search input
	 * @param {Event & { currentTarget: EventTarget & HTMLInputElement; }} e
	 */
	async function fetchLocationOptions(e) {
		if (debounceTimer) clearTimeout(debounceTimer);
		if (currentRequest) currentRequest.abort();

		debounceTimer = setTimeout(async () => {
			try {
				// Return if e.target is not correct type
				if (!(e.target instanceof HTMLInputElement)) return;

				const input = e.target.value.trim();

				// Return if less than three characters
				if (input.length < 3) {
					options = [];
					shouldShowMenu = false;
					return;
				}

				const controller = new AbortController();
				currentRequest = controller;

				// Check if input matches postal code pattern
				const isPostalCode = /^\d{5}$|^[A-Za-z]\d[A-Za-z]/.test(input);

				// Fetch locations
				const url = isPostalCode
					? `https://api.geoapify.com/v1/geocode/search?postcode=${input}&filter=countrycode:us,ca&format=json&apiKey=${import.meta.env.VITE_GEOAPIFY_KEY}`
					: `https://api.geoapify.com/v1/geocode/autocomplete?text=${input}&type=city&filter=countrycode:us,ca&format=json&apiKey=${import.meta.env.VITE_GEOAPIFY_KEY}`;

				const response = await fetch(url);
				const data = await response.json();

				// Store options;
				options = formatOptions(data);

				// Show options
				shouldShowMenu = true;
			} catch (err) {
				console.error(err);
			} finally {
				currentRequest = null;
			}
		}, 300);
	}

	/**
	 * Handle when an option is selected from the menu
	 * @param {OptionObject} option
	 */
	function handleOptionSelection(option) {
		// Set selected label
		selectedLabel = `${option.body.label}`;
		// Close menu
		shouldShowMenu = false;
		// Attach results
		results = option.body;
	}
</script>

<div class="location-search">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24"
		viewBox="0 -960 960 960"
		width="24"
		class="glass"
		><path
			d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"
			fill="currentColor" /></svg>
	<input
		class="input"
		type="text"
		name="loc"
		placeholder="Start typing a location..."
		oninput={fetchLocationOptions}
		bind:value={selectedLabel} />
</div>
{#if shouldShowMenu}
	<ClickOutside bind:shouldShowContainer={shouldShowMenu}>
		<div class="wrapper">
			<div class="menu" in:slide={{ duration: 250 }}>
				{#if options.length === 0}
					<div class="option">No locations found..</div>
				{:else}
					{#each options as option}
						<button type="button" class="option" onclick={() => handleOptionSelection(option)}
							>{option.body.label}</button>
					{/each}
				{/if}
			</div>
		</div>
	</ClickOutside>
{/if}

<style>
	.location-search {
		display: flex;
		align-items: center;
		gap: 8px;
		transition: color 0.25s ease;
	}

	.glass {
		color: inherit;
	}

	.input {
		border: none;
		color: var(--primary);
		font-family: inherit;
		font-size: inherit;
		outline: none;
		width: 100%;
	}

	.location-search,
	.input {
		background-color: var(--bg-ff);
	}

	.wrapper {
		display: flex;
		justify-content: center;
		left: 0;
		margin-left: -2px;
		margin-right: -2px;
		position: absolute;
		right: 0;
		top: 50px;
		z-index: 1000;
	}

	.menu {
		width: 100%;
		margin-top: 8px;
		border: 2px solid var(--accent);
		border-radius: var(--brad);
		background-color: var(--bg-ff);
		display: flex;
		flex-direction: column;
	}

	.menu:focus-within {
		border-color: var(--accent);
	}

	.option {
		background: none;
		border: none;
		text-align: left;
		color: var(--primary);
		padding: 8px;
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
	}

	.option:hover,
	.option:focus {
		color: var(--accent);
		border: none;
		outline: none;
	}
</style>
