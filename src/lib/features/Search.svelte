<script>
	let inputValue = '';
	/** @type {number} */
	let debounceTimer;
	/** @type {Array<OptionObject>}*/
	let options = [];

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
		return results.map(({ formatted, lat, lon, place_id }) => {
			const body = {
				lat,
				lon,
				label: formatted,
			};
			return { id: place_id, body };
		});
	}

	async function fetchLocationOptions() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(async () => {
			try {
				const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${inputValue}&type=city&filter=countrycode:us,ca&format=json&apiKey=${
					import.meta.env.VITE_GEOAPIFY_KEY
				}`;
				const response = await fetch(url);
				const data = await response.json();
				options = formatOptions(data);
			} catch (err) {
				console.error(err);
			}
		}, 450);
	}

	$: shouldShowMenu = options.length;
</script>

<form
	class="form"
	action="/search"
>
	<div class="search-bar">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			height="24"
			viewBox="0 -960 960 960"
			width="24"
			class="glass"
			><path
				d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"
				fill="currentColor"
			/></svg
		>
		<input
			class="input"
			type="text"
			on:input={fetchLocationOptions}
			bind:value={inputValue}
		/>
	</div>
	{#if shouldShowMenu}
		<div class="menu">
			{#each options as option}
				<div class="option">
					<input
						class="radio"
						type="radio"
						id={option.id}
						name="coord"
						value={`${option.body.lat},${option.body.lon}`}
					/>
					<label
						class="label"
						for={option.id}>{option.body.label}</label
					>
				</div>
			{/each}
		</div>
	{/if}
</form>

<style>
	.search-bar {
		display: flex;
		gap: 4px;
		box-shadow: var(--box-shadow);
		color: var(--gray-3);
		border: var(--gray-3) 1.5px solid;
		padding: 8px 16px;
		border-radius: var(--brad) 0 0 var(--brad);
		padding: 8px 16px;
		background-color: var(--bg-ff);
	}

	.search-bar:focus-within {
		color: var(--accent);
		border-color: var(--accent);
	}

	.input {
		font-family: inherit;
		color: var(--primary);
		font-size: inherit;
		outline: none;
		border: none;
		background-color: var(--bg-ff);
	}

	.menu {
		display: flex;
		flex-direction: column;
		background-color: white;
		position: relative;
	}

	.radio {
		visibility: hidden;
		position: absolute;
	}

	.label {
		display: block;
		width: 100%;
	}
</style>
