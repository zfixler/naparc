<script>
	import { Congregation } from '$lib/features';
	import { Pagination } from '$lib/components';
	import { calculateViewedResults } from '$lib/utils';

	/** @type {{data: any}} */
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

{#if data.congregations}
	{#key data.page}
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
		margin-top: 12px;
	}
</style>
