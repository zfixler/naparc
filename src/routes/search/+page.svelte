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
			<h2 class="result-title">Search Results</h2>
			<p class="result-summary">
				Showing {viewingResults.startIndex}–{viewingResults.endIndex} of {data.totalResults}
				congregations within {data.radius} miles of <strong>{data.location}</strong>.
			</p>
		</section>

		<Map lat={parseFloat(data.lat)} lon={parseFloat(data.lon)} locations={data.congregations} />
		{#each data.congregations as congregation (congregation.id)}
			<Congregation {congregation} />
		{/each}
	{:else}
		<section class="empty">
			<h2 class="result-title">No results</h2>
			<p class="result-summary">
				We did not find any congregations within {data.radius} miles of
				<strong>{data.location}</strong>.
			</p>
			<ul class="suggestions">
				<li>Widen the search radius in the settings menu above.</li>
				<li>Re-enable any denominations you filtered out.</li>
				<li>Try a nearby city or a larger metropolitan area.</li>
			</ul>
		</section>
	{/if}

	{#if hasMultiplePages}
		<Pagination currentPage={data.page} totalPages={data.totalPages} />
	{/if}
{/key}

<style>
	/*
	 * Previously a 25%/auto grid, which squeezed the heading into a narrow column and
	 * cramped the summary beside it at small widths. Stacking reads cleanly at every size.
	 */
	.result-header {
		margin-bottom: var(--margin);
	}

	.result-title {
		margin-bottom: 4px;
	}

	.result-summary {
		opacity: 0.85;
	}

	.empty {
		background-color: var(--bg-ff);
		border-radius: var(--brad);
		box-shadow: var(--box-shadow);
		padding: var(--padding);
	}

	.suggestions {
		margin: 12px 0 0 20px;
		line-height: 1.7;
	}
</style>
