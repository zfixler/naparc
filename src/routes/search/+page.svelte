<script>
	import { page } from '$app/stores';
	import { Congregation } from '$lib/features';
	import { Pagination } from '$lib/components';
	/** @type {{data: any}} */
	let { data } = $props();

	/**
	 * Calculates the range of results currently being viewed on the given page.
	 *
	 * @param {number} currentPage - The current page number.
	 * @param {number} totalResults - The total number of results available.
	 * @returns {{ startIndex: number, endIndex: number }} An object containing the start and end indices of the results being viewed.
	 */
	function calculateViewedResults(currentPage = 1, totalResults = 1) {
		const resultsPerPage = 10;
		const startIndex = (currentPage - 1) * resultsPerPage + 1;
		const endIndex = Math.min(currentPage * resultsPerPage, totalResults);
		return {
			startIndex,
			endIndex,
		};
	}

	let viewingResults = $derived(calculateViewedResults(data.page, data.totalResults));
	let hasMultiplePages = $derived(data.totalPages ? data.totalPages > 1 : false);
</script>

<section class="result-header">
	<h2>Search Results:</h2>
	<p>
		{data.location}. <br /> Viewing results ({viewingResults.startIndex} to {viewingResults.endIndex}
		of {data.totalResults}) within {data.radius} miles.
	</p>
</section>

{#if data.congregations}
	{#key $page.url.searchParams}
		{#each data.congregations as congregation}
			<Congregation {congregation} />
		{/each}
	{/key}
{/if}
{#if hasMultiplePages}
	<Pagination currentPage={data.page} totalPages={data.totalPages} />
{/if}

<style>
	.result-header {
		display: flex;
		gap: 16px;
		margin-top: 16px;
	}

	.result-header p {
		margin-top: 2px;
	}
</style>
