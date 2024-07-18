<script>
	import { page } from '$app/stores';
	import { Congregation } from '$lib/features';
	export let data;

	$: results = data.congregations?.length || 0;
</script>

<section class="result-header">
	<h2>Search Results:</h2>
	<span>{data.location}, {results} results within {data.radius} miles</span>
</section>

{#if data.congregations}
	{#key $page.url.searchParams}
		{#each data.congregations as congregation}
			<Congregation {congregation} />
		{/each}
	{/key}
{/if}

<style>
	.result-header {
		display: flex;
		gap: 16px;
		align-items: baseline;
		margin-top: 16px;
	}
</style>
