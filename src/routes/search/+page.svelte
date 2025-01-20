<script>
	import { page } from '$app/state';
	import { Head, Pagination } from '$lib/components';
	import { Congregation } from '$lib/features';
	import { calculateViewedResults } from '$lib/utils';

	/**
	 * @type {{
	 *   data: {
	 *     page: number;
	 *     totalResults: number;
	 *     totalPages: number;
	 *	   location: string,
	 *	   radius: number,
	 *     denomination: import('@prisma/client').Denomination;
	 *     congregations: Array<import('@prisma/client').Congregation>;
	 *   }
	 * }}
	 */
	let { data } = $props();

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

<Head title="NAPARC Search | Results for {data.location}" />

{#if data.congregations}
	{#key page.url}
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
</style>
