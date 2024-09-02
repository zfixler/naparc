<script>
	export let props;
	const {
		name,
		distance,
		denominationSlug,
		denominationName,
		presbyteryName,
		presbyterySlug,
        isContinental,
	} = props;
</script>

<header class="header">
	<h3 class="title">{name}</h3>
	{#if distance}
    <aside class="aside">
        <span
            title={denominationName}
            data-toggle="tooltip"
        >
            <a
                class="denomination"
                href={`/denominations#${denominationSlug}`}
                >{denominationSlug.toUpperCase()}</a
            >
        </span>
        {#if presbyteryName}
            <a
                class="presbytery"
                href={`/${denominationSlug}/${presbyterySlug}`}>{presbyteryName}{isContinental ? ' Classis' : ' Presbytery'}</a
            >
        {/if}
    </aside>
    <small class="distance">{distance.toFixed(2)} miles</small>
	{/if}
</header>

<style>
	.header {
		padding-bottom: var(--padding);
        display: grid;
        grid-template-areas: 
                 "title title dist"
                 "aside blank blank";
	}
    
    .title {
        grid-area: title;
    }

	.aside {
        grid-area: aside;
        display: flex;
        gap: 8px;
	}

    .distance {
        grid-area: dist;
        text-align: end;
        align-self: center;
    }

    .denomination,
    .presbytery {
        color: inherit;
    }

    .denomination:hover,
    .denomination:active,
    .denomination:focus,
    .presbytery:hover,
    .presbytery:active,
    .presbytery:focus {
        color: var(--accent);
    }

    .denomination {
        font-weight: bold;
    }
</style>
