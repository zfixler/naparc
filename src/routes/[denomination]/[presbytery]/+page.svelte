<script>
	import { Congregation } from '$lib/features';
	/** @type {{data: any}} */
	let { data } = $props();
	const { presbytery } = data;
</script>

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
		{#each presbytery.congregations as congregation}
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
