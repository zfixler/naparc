<script>
    import { Denomination } from '$lib/features';
    export let data;
    const { denominations } = data;
</script>

{#each denominations as denomination}
    <Denomination {denomination} />
{/each}