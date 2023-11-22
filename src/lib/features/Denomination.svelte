<script>
    export let denomination;
    const { id, slug, name, abbr, description, presbyteries } = denomination;
    let shouldShowDetails = false;
</script>

<section>
    <button on:click={() => shouldShowDetails = !shouldShowDetails}>{name}</button>
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