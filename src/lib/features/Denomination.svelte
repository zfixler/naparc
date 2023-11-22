<script>
    import { goto } from "$app/navigation";
    import { page } from '$app/stores';
    export let denomination;
    const { id, slug, name, abbr, description, presbyteries } = denomination;
    
    function openDenomination() {
        goto(`?show=${slug}`)
    }
    
    $: shouldShowDetails = $page.url.searchParams.get('show') === slug;
</script>

<section>
    <button on:click={openDenomination}>{name}</button>
    <div class={shouldShowDetails ? 'show' : 'hide'}>
        <p>{description}</p>
        <p>
            {#if presbyteries.length}
                Presbyteries:
                <ul>
                    {#each presbyteries as presbytery}
                        <li><a href={`/presbytery/${presbytery.id}`}>{presbytery.name}</a></li>
                    {/each}
                </ul>
            {:else}
                There are currently no presbyteries supported for this denomination.
            {/if}
        </p>
    </div>
</section>

<style>
    .hide {
        display: none;
    }

    .show {
        display: block;
    }
</style>