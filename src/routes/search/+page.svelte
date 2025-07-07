<script>
	import { page } from '$app/state';
	import { Head, Map, Pagination } from '$lib/components';
	import { Congregation } from '$lib/features';
	import { calculateViewedResults } from '$lib/utils';

	/**
	 * @type {{
	 *   data: {
	 *     page: number;
	 *     totalResults: number;
	 *     totalPages: number;
	 *	   location: string,
	 *	   lat: string,
	 *	   lon: string,
	 *	   radius: number,
	 *     denomination: import('@prisma/client').Denomination;
	 *     congregations: Array<import('@prisma/client').Congregation>;
	 *   }
	 * }}
	 */
	let { data } = $props();

	let search = $derived(page.url.search);

	let viewingResults = $derived(calculateViewedResults(data.page, data.totalResults));
	let hasMultiplePages = $derived(data.totalPages ? data.totalPages > 1 : false);
</script>

<Head title="NAPARC Search | Results for {data.location}" />

{#key search}
	{#if data.congregations.length}
		<section class="result-header">
			<h2>Search Results:</h2>
			<p>
				{data.location}. Viewing results ({viewingResults.startIndex} to {viewingResults.endIndex}
				of {data.totalResults}) within {data.radius} miles.
			</p>
		</section>

		<Map lat={parseFloat(data.lat)} lon={parseFloat(data.lon)} locations={data.congregations} />
		{#each data.congregations as congregation (congregation.id)}
			<Congregation {congregation} />
		{/each}
	{:else}
		<p>Your search did not return any results.</p>
	{/if}

	{#if hasMultiplePages}
		<Pagination currentPage={data.page} totalPages={data.totalPages} />
	{/if}
{/key}

<style>
	.result-header {
		display: grid;
		gap: 16px;
		margin-bottom: var(--margin);
		grid-template-columns: 25% auto;
	}
</style>
