<script>
	import { Head, StructuredData } from '$lib/components';
	import { Congregation } from '$lib/features';
	import { congregationListSchema } from '$lib/utils/structuredData';
	/**
	 * @typedef {import('@prisma/client').Presbytery} Presbytery
	 * @typedef {import('@prisma/client').Denomination} Denomination
	 * @typedef {import('@prisma/client').Congregation} Congregation
	 */

	/**
	 * @type {{
	 *   data: {
	 *     presbytery: Presbytery & {
	 *       denomination: Denomination,
	 *       congregations: Congregation[]
	 *     }
	 *   }
	 * }}
	 */
	let { data } = $props();
	const presbytery = $derived(data.presbytery);

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
	description="{presbytery.congregations.length} {presbytery.denomination.abbr} {presbytery
		.congregations.length === 1
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
	</header>
	<div class="container">
		{#each presbytery.congregations as congregation (congregation.id)}
			<Congregation {congregation} />
		{/each}
	</div>
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
</style>
