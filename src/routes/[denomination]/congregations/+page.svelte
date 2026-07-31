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
	 *     denomination: import('@prisma/client').Denomination;
	 *     congregations: Array<import('@prisma/client').Congregation>;
	 *   }
	 * }}
	 */
	let { data } = $props();

	let viewingResults = $derived(calculateViewedResults(data.page, data.totalResults));
	let hasMultiplePages = $derived(data.totalPages ? data.totalPages > 1 : false);
</script>

<Head
	title="NAPARC Search | {data.denomination.abbr}"
	description={data.denomination.description} />

<header class="header">
	<h1 class="denomination">{data.denomination.name}</h1>
	<p class="results">
		Viewing results {viewingResults.startIndex} to {viewingResults.endIndex} of {data.totalResults}.
	</p>
</header>
<div class="container">
	{#key page.url}
		{#each data.congregations as congregation (congregation.id)}
			<Congregation {congregation} />
		{/each}
	{/key}
</div>

{#if hasMultiplePages}
	<Pagination currentPage={data.page} totalPages={data.totalPages} />
{/if}

<style>
	.header {
		border-bottom: 1px solid var(--line);
		margin-bottom: var(--space-md);
		padding-bottom: var(--space-md);
		width: 100%;
	}

	.denomination {
		font-size: var(--fs-h2);
	}

	.results {
		color: var(--muted);
		font-size: var(--fs-small);
		font-variant-numeric: tabular-nums;
		margin-top: var(--space-2xs);
	}
</style>
