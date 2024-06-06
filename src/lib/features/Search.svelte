<script>
	import { ClickOutside } from '$lib/components';

	let inputValue = '';
	/** @type {NodeJS.Timeout|number|undefined} */
	let debounceTimer;
	/** @type {Array<OptionObject>}*/
	let options = [
		{
			id: '512bb7fea7ac0554c0599101ea1736944440f00101f901dddf020000000000c00208',
			body: {
				lat: 41.1579008,
				lon: -80.0886631,
				label: 'Grove City, PA, United States of America',
			},
		},
		{
			id: '512c6519e2580554c0595c2041f163944440c00206e2031e77686f736f6e66697273743a6c6f63616c6974793a313031373138313039',
			body: {
				lat: 41.1593,
				lon: -80.08355,
				label: 'Grove City, Grove City, PA, United States of America',
			},
		},
	];
	let shouldShowMenu = false;

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
				if (options) shouldShowMenu = true;
			} catch (err) {
				console.error(err);
			}
		}, 450);
	}
</script>

<form
	class="form"
	action="/search"
>
	<ClickOutside bind:shouldShowContainer={shouldShowMenu}>
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
	</ClickOutside>
</form>

<style>
	.search-bar {
		background-color: var(--bg-ff);
		border: 1.5px solid;
		border-color: inherit;
		border-radius: var(--brad) 0 0 var(--brad);
		box-shadow: var(--box-shadow);
		display: flex;
		gap: 4px;
		padding: 10px 10px 11px 10px;
	}

	.form {
		border-color: var(--gray-3);
	}

	.form:focus-within {
		color: var(--accent);
	}

	.glass {
		color: inherit;
	}

	.input {
		background-color: var(--bg-ff);
		border: none;
		color: var(--primary);
		font-family: inherit;
		font-size: inherit;
		outline: none;
	}

	.menu {
		background-color: var(--bg-ff);
		border: 1.5px solid;
		border-color: inherit;
		border-radius: 0 0 var(--brad) var(--brad);
		display: flex;
		flex-direction: column;
		margin-top: -3px;
		padding-top: 6px;
		position: relative;
	}

	.radio {
		position: absolute;
		visibility: hidden;
	}

	.label {
		background-color: var(--bg-ff);
		display: block;
		padding: 8px;
		width: 100%;
		color: var(--primary);
	}

	.label:hover {
		color: var(--accent);
		cursor: pointer;
	}

	.option:nth-last-child(-n + 1) .label {
		border-radius: 0 0 var(--brad) var(--brad);
	}
</style>
