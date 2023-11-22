<script>
    import { Congregation } from '$lib/features';
    export let data;
    const { presbytery } = data;
</script>

{#if presbytery}
<h1>{presbytery.denomination.name}</h1>
<h2>{presbytery.name}</h2>
{#each presbytery.congregations as congregation}
    <Congregation {congregation} />
{/each}
{/if}