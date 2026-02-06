<script>
	import { Head } from '$lib/components';
	import { Congregation } from '$lib/features';
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
</script>

<Head
	title="NAPARC Search | {presbytery.denomination.abbr} | {presbytery.name}"
	description={presbytery.denomination.description} />

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
		width: var(--container-width);
		padding-top: 24px;
	}
</style>
