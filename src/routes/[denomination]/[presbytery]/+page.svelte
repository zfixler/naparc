<script>
	import { page } from '$app/state';
	import { Head, Pagination, StructuredData } from '$lib/components';
	import { Congregation } from '$lib/features';
	import { calculateViewedResults } from '$lib/utils';
	import { congregationListSchema } from '$lib/utils/structuredData';
	/**
	 * @typedef {Record<string, any>} Presbytery
	 * @typedef {Record<string, any>} Denomination
	 * @typedef {Record<string, any>} Congregation
	 */

	/**
	 * @type {{
	 *   data: {
	 *     page: number,
	 *     totalResults: number,
	 *     totalPages: number,
	 *     presbytery: Presbytery & {
	 *       denomination: Denomination,
	 *       congregations: Congregation[]
	 *     }
	 *   }
	 * }}
	 */
	let { data } = $props();
	const presbytery = $derived(data.presbytery);
	const viewingResults = $derived(calculateViewedResults(data.page, data.totalResults));
	const hasMultiplePages = $derived(data.totalPages > 1);

	const schema = $derived(
		congregationListSchema(
			presbytery.congregations,
			`${presbytery.denomination.abbr} congregations in the ${presbytery.name} ${
				presbytery.denomination.continental ? 'Classis' : 'Presbytery'
			}`,
		),
	);
</script>

<!--
	Descriptions are built per presbytery rather than reusing the denomination's
	blurb, which was identical across every presbytery of a given denomination.
-->
<Head
	title="{presbytery.name} {presbytery.denomination.continental
		? 'Classis'
		: 'Presbytery'} | {presbytery.denomination.abbr} | NAPARC Search"
	description="{data.totalResults} {presbytery.denomination.abbr} {data.totalResults === 1
		? 'congregation'
		: 'congregations'} in the {presbytery.name} {presbytery.denomination.continental
		? 'Classis'
		: 'Presbytery'}, with addresses and contact details for each church." />
<StructuredData data={schema} />

{#if presbytery}
	<header class="header">
		<h1 class="denomination">{presbytery.denomination.name}</h1>
		<h2 class="presbytery">
			{presbytery.name}
			{#if presbytery.denomination.continental}
				Classis
			{:else}
				Presbytery
			{/if}
		</h2>
		<p class="results">
			Viewing results {viewingResults.startIndex} to {viewingResults.endIndex} of {data.totalResults}.
		</p>
	</header>
	<div class="container">
		{#key page.url}
			{#each presbytery.congregations as congregation (congregation.id)}
				<Congregation {congregation} />
			{/each}
		{/key}
	</div>
	{#if hasMultiplePages}
		<Pagination currentPage={data.page} totalPages={data.totalPages} />
	{/if}
{/if}

<style>
	.header {
		border-bottom: 1px solid var(--line);
		margin-bottom: var(--space-md);
		padding-bottom: var(--space-md);
		width: 100%;
	}

	.denomination {
		color: var(--muted);
		font-family: var(--ff-body);
		font-size: var(--fs-small);
		font-weight: var(--fw-semibold);
		letter-spacing: var(--tracking-wide);
		margin-bottom: var(--space-3xs);
		text-transform: uppercase;
	}

	.presbytery {
		font-size: var(--fs-h2);
	}

	.results {
		color: var(--muted);
		font-size: var(--fs-small);
		font-variant-numeric: tabular-nums;
		margin-top: var(--space-2xs);
	}
</style>
