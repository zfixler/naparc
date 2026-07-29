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
	 *     pins: Array<import('./+page.server.js').MapPin>;
	 *   }
	 * }}
	 */
	let { data } = $props();

	/*
	 * The map's contents depend on the search itself, not on which page of the list is
	 * showing. Keying it separately from `search` means paging through results no longer
	 * tears the map down and discards the reader's pan and zoom.
	 */
	let mapKey = $derived.by(() => {
		const params = new URLSearchParams(page.url.search);
		params.delete('pg');
		return params.toString();
	});

	let viewingResults = $derived(calculateViewedResults(data.page, data.totalResults));
	let hasMultiplePages = $derived(data.totalPages ? data.totalPages > 1 : false);
</script>

<Head title="NAPARC Search | Results for {data.location}" />

{#if data.congregations.length}
	<!--
		This caption sits above the map, which plots the entire result set, so it states the
		total. The "showing x–y" range describes only the list slice and lives with the
		paginator that controls it.
	-->
	<section class="result-header">
		<h2 class="result-title">Search Results</h2>
		<p class="result-summary">
			{data.totalResults}
			{data.totalResults === 1 ? 'congregation' : 'congregations'} within {data.radius} miles of
			<strong>{data.location}</strong>.
		</p>
	</section>

	{#key mapKey}
		<Map lat={parseFloat(data.lat)} lon={parseFloat(data.lon)} locations={data.pins} />
	{/key}
	<!-- Scroll/focus target for the paginator, so paging lands on the list, not the map -->
	<div id="results" class="results" tabindex="-1">
		{#each data.congregations as congregation (congregation.id)}
			<Congregation {congregation} />
		{/each}
	</div>
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
	<Pagination
		currentPage={data.page}
		totalPages={data.totalPages}
		startIndex={viewingResults.startIndex}
		endIndex={viewingResults.endIndex}
		totalResults={data.totalResults} />
{/if}

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

	/*
	 * The list container only receives focus programmatically, as a scroll target for the
	 * paginator. It is not an interactive control, so a ring around the whole list would be
	 * noise — screen readers still announce it on focus.
	 */
	.results:focus,
	.results:focus-visible {
		outline: none;
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
