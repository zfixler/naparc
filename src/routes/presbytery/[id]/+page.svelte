<script>
    import { Congregation } from '$lib/features';
    import { getRegionalTitle } from '$lib/utils';
    export let data;
    const { presbytery } = data;
</script>

{#if presbytery}
<header class="header">
    <h1 class="denomination">{presbytery.denomination.name}</h1>
    <h2 class="presbytery">{presbytery.name} {getRegionalTitle(presbytery.denomination.slug)}</h2>
</header>
<main class="container">
    {#each presbytery.congregations as congregation}
        <Congregation {congregation} />
    {/each}
</main>
{/if}

<style>
    .header,
    .container {
        width: var(--container-width);
        margin: 0 auto;
    }

    .header {
        padding: 24px;
    }
</style>