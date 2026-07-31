<script>
	/** @type {{props: any}} */
	let { props } = $props();
	const name = $derived(props.name);
	const distance = $derived(props.distance);
	const denominationSlug = $derived(props.denominationSlug);
	const denominationName = $derived(props.denominationName);
	const presbyteryName = $derived(props.presbyteryName);
	const presbyterySlug = $derived(props.presbyterySlug);
	const isContinental = $derived(props.isContinental);
	const id = $derived(props.id);
</script>

<header class="header">
	<h3 class="title" {id}>{name}</h3>
	{#if distance}
		<aside class="aside">
			<span title={denominationName} data-toggle="tooltip">
				<a class="denomination" href={`/denominations#${denominationSlug}`}
					>{denominationSlug.toUpperCase()}</a>
			</span>
			{#if presbyteryName}
				<a class="presbytery" href={`/${denominationSlug}/${presbyterySlug}`}
					>{presbyteryName}{isContinental ? ' Classis' : ' Presbytery'}</a>
			{/if}
		</aside>
		<small class="distance">{distance.toFixed(2)} miles</small>
	{/if}
</header>

<style>
	.header {
		display: grid;
		grid-template-areas:
			'title dist'
			'aside dist';
		grid-template-columns: 1fr auto;
		column-gap: var(--space-sm);
		row-gap: var(--space-2xs);
		padding-bottom: var(--space-md);
	}

	.title {
		grid-area: title;
		font-size: var(--fs-h4);
		font-weight: var(--fw-semibold);
		letter-spacing: -0.01em;
		scroll-margin-top: var(--space-xl);
	}

	.aside {
		grid-area: aside;
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
	}

	.distance {
		grid-area: dist;
		align-self: start;
		color: var(--muted);
		font-size: var(--fs-small);
		font-variant-numeric: tabular-nums;
		justify-self: end;
		margin-top: 4px;
		white-space: nowrap;
	}

	.denomination {
		background-color: var(--accent-soft);
		border-radius: var(--radius-pill);
		color: var(--accent-strong);
		display: inline-block;
		font-size: var(--fs-micro);
		font-weight: var(--fw-semibold);
		letter-spacing: 0.06em;
		padding: 3px var(--space-2xs);
		transition:
			background-color var(--speed) var(--ease),
			color var(--speed) var(--ease);
	}

	.denomination:visited {
		color: var(--accent-strong);
	}

	.denomination:hover,
	.denomination:active,
	.denomination:focus-visible {
		background-color: var(--accent);
		color: var(--on-accent);
	}

	.presbytery {
		color: var(--muted);
		font-size: var(--fs-small);
	}

	.presbytery:visited {
		color: var(--muted);
	}

	.presbytery:hover,
	.presbytery:active,
	.presbytery:focus-visible {
		color: var(--accent);
	}

	@media (max-width: 480px) {
		.header {
			grid-template-areas:
				'title dist'
				'aside aside';
		}
	}
</style>
