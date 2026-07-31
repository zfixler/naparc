<script>
	import { page } from '$app/state';
	/** @type {{denomination: import('../../routes/denominations/+page.server.js').ExtendedDenomination}} */
	let { denomination } = $props();
	const slug = $derived(denomination.slug);
	const name = $derived(denomination.name);
	const description = $derived(denomination.description);
	const presbyteries = $derived(denomination.presbyteries);
	const continental = $derived(denomination.continental);
	const _count = $derived(denomination._count);
	const scrapeLogs = $derived(denomination.scrapeLogs);

	let shouldShowDetails = $derived(page.url.hash === `#${slug}`);
	const completedAt = $derived(
		scrapeLogs[0].completedAt
			? new Intl.DateTimeFormat('en-US').format(scrapeLogs[0].completedAt)
			: null,
	);
</script>

<details class="section" open={shouldShowDetails}>
	<summary class="button">
		<h2 class="denomination" id={slug}>
			{name}
			{#if presbyteries.length || _count.congregations > 0}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="24px"
					viewBox="0 -960 960 960"
					width="24px"
					class="check-icon"
					fill="currentColor"
					><path
						d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg>
			{/if}
		</h2>
		<span class="chevron">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24px"
				viewBox="0 -960 960 960"
				width="24px"
				fill="currentColor"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" /></svg>
		</span>
	</summary>
	<p class="description">{description}</p>
	<div class="presbyteries">
		{#if presbyteries.length}
			<b>{continental ? 'Classis:' : 'Presbyteries:'}</b>
			<ul>
				{#each presbyteries as presbytery (presbytery.slug)}
					<li>
						<a href={`/${slug}/${presbytery.slug}`}>{presbytery.name}</a>
					</li>
				{/each}
			</ul>
		{:else if _count.congregations > 0}
			<a href={`/${slug}/congregations`}>View all congregations.</a>
		{:else}
			There are currently no {continental ? 'classis' : 'presbyteries'} supported for this denomination.
		{/if}
	</div>
	{#if completedAt}
		<small class="updated">Updated on {completedAt}</small>
	{/if}
</details>

<style>
	.section {
		background: var(--bg-ff);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
		margin-top: var(--space-xs);
		padding: var(--space-2xs) var(--space-md) var(--space-md);
		transition:
			border-color var(--speed) var(--ease),
			box-shadow var(--speed) var(--ease);
	}

	.section:hover {
		border-color: var(--line-strong);
	}

	.section[open] {
		box-shadow: var(--shadow-sm);
	}

	.denomination {
		align-items: center;
		color: var(--primary);
		display: flex;
		font-size: var(--fs-h4);
		font-weight: var(--fw-semibold);
		gap: var(--space-2xs);
		letter-spacing: -0.01em;
		scroll-margin-top: var(--space-xl);
	}

	.button {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		font-family: inherit;
		justify-content: space-between;
		outline: none;
		text-align: start;
		width: 100%;
	}

	summary {
		align-items: center;
		cursor: pointer;
		display: flex;
		gap: var(--space-sm);
		justify-content: space-between;
		min-height: 56px;
		list-style: none;
	}

	details summary::-webkit-details-marker {
		display: none;
	}

	summary:focus-visible {
		border-radius: var(--radius-xs);
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	svg {
		height: 20px;
		width: 20px;
		flex-shrink: 0;
	}

	.chevron {
		align-items: center;
		color: var(--muted);
		display: flex;
		transition:
			transform var(--speed) var(--ease),
			color var(--speed) var(--ease);
	}

	summary:hover .chevron {
		color: var(--accent);
	}

	details[open] .chevron {
		transform: rotate(90deg);
	}

	.description {
		color: var(--secondary);
		font-size: var(--fs-small);
		margin: 0 0 var(--space-md);
		max-width: 68ch;
	}

	.presbyteries {
		border-top: 1px solid var(--line);
		color: var(--secondary);
		font-size: var(--fs-small);
		padding-top: var(--space-md);
	}

	b {
		color: var(--muted);
		display: block;
		font-size: var(--fs-micro);
		font-weight: var(--fw-semibold);
		letter-spacing: var(--tracking-wide);
		margin-bottom: var(--space-2xs);
		text-transform: uppercase;
	}

	ul {
		column-gap: var(--space-md);
		display: grid;
		grid-template-columns: 1fr 1fr;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		margin: 0;
	}

	li a {
		border-radius: var(--radius-xs);
		display: block;
		padding: var(--space-2xs) 0;
	}

	.check-icon {
		color: var(--accent);
		height: 18px;
		width: 18px;
	}

	.updated {
		color: var(--muted);
		display: block;
		font-size: var(--fs-micro);
		margin-top: var(--space-md);
		text-align: right;
	}

	@media (max-width: 800px) {
		.section {
			padding: var(--space-2xs) var(--space-sm) var(--space-sm);
		}

		summary {
			gap: var(--space-xs);
			min-height: 48px;
		}

		.updated {
			text-align: left;
		}
	}

	@media (max-width: 480px) {
		ul {
			grid-template-columns: 1fr;
		}
	}
</style>
