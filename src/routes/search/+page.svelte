<script>
	import { page } from '$app/state';
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

<svelte:head>
	<title>NAPARC Search | Results for {data.location}</title>
	<meta name="description" content="Search and explore NAPARC churches near you." />
</svelte:head>

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
