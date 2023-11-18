<script>

let inputValue = '';
/** @type {number} */
let debounceTimer;
/** @type {Array<OptionObject>}*/
let options = [];
const shouldShowOptions = false;

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
			label: formatted
		}
		return { id: place_id, body }
	});
}

async function fetchLocationOptions() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
        try {
            const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${inputValue}&type=city&filter=countrycode:us,ca&format=json&apiKey=${import.meta.env.VITE_GEOAPIFY_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            options = formatOptions(data);
        } catch(err) {
            console.error(err);
        }
    }, 450);
}
</script>
<form action="/search">
    <input type="text" on:input={fetchLocationOptions} bind:value={inputValue}/>
    <button >Search</button>
	{#if options.length }
	<ul>
		{#each options as option}
		<li>{option.body.label}</li>
		{/each}
	</ul>
	{/if}

</form>

<style>
</style>