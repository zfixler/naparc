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

<!--
	Result pages are one page per lat/lon/radius/filter combination, so they are
	an unbounded set of near-duplicates. Indexing them wastes crawl budget and
	competes with the pages worth ranking; `follow` still passes link equity on
	to the congregation and presbytery pages listed here.
-->
<Head
	title="Churches near {data.location} | NAPARC Search"
	description="{data.totalResults} NAPARC {data.totalResults === 1
		? 'congregation'
		: 'congregations'} within {data.radius} miles of {data.location}."
	noindex />

{#if data.congregations.length}
	<!--
		This caption sits above the map, which plots the entire result set, so it states the
		total. The "showing x–y" range describes only the list slice and lives with the
		paginator that controls it.
	-->
	<section class="result-header">
		<h1 class="result-title">Search Results</h1>
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
		<h1 class="result-title">No results</h1>
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
	.result-header {
		margin-bottom: var(--space-md);
	}

	.result-title {
		font-size: var(--fs-h3);
		margin-bottom: var(--space-3xs);
	}

	.result-summary {
		color: var(--secondary);
		font-size: var(--fs-small);
		max-width: 60ch;
	}

	.result-summary strong {
		color: var(--primary);
	}

	.results:focus,
	.results:focus-visible {
		outline: none;
	}

	.empty {
		background-color: var(--bg-ff);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
		padding: var(--space-xl) var(--space-lg);
		text-align: center;
	}

	.empty .result-title {
		margin: 0 auto var(--space-2xs);
	}

	.empty .result-summary {
		margin: 0 auto;
	}

	.suggestions {
		color: var(--secondary);
		display: inline-block;
		font-size: var(--fs-small);
		line-height: 1.9;
		margin: var(--space-md) 0 0;
		padding-left: var(--space-md);
		text-align: left;
	}

	.suggestions::marker {
		color: var(--muted);
	}
</style>
