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
		border-radius: var(--brad);
		box-shadow: var(--box-shadow);
		margin-top: var(--margin);
		padding: var(--padding);
	}

	.denomination {
		align-items: center;
		color: var(--primary);
		display: flex;
		gap: 16px;
		scroll-margin-top: calc(var(--margin) * 2);
	}

	.button {
		background: none;
		border: none;
		cursor: pointer;
		display: flex;
		font-family: inherit;
		font-size: var(--fs-h3);
		justify-content: space-between;
		outline: none;
		text-align: start;
		width: 100%;
	}

	summary {
		align-items: center;
		cursor: pointer;
		display: flex;
		gap: 16px;
		justify-content: space-between;
		min-height: 48px;
	}

	details summary::-webkit-details-marker {
		display: none;
	}

	svg {
		min-height: 32px;
		min-width: 32px;
		transition: transform 0.2s ease;
	}

	.chevron {
		color: var(--primary);
		transition: transform 250ms ease;
	}

	details[open] .chevron {
		transform: rotate(90deg);
	}

	.description {
		margin: var(--margin) 0;
	}

	.presbyteries {
		margin-top: var(--margin);
	}

	b {
		margin-bottom: var(--margin);
	}

	ul {
		display: grid;
		grid-template-columns: 1fr 1fr;
		list-style: none;
		margin: var(--margin-sm) 0 0;
		padding: 0;
	}

	li {
		margin: 8px 0;
	}

	.check-icon {
		color: var(--accent);
	}

	.updated {
		display: flex;
		justify-self: end;
	}

	@media (max-width: 800px) {
		details {
			padding: calc(var(--padding) * 0.75);
		}

		summary {
			gap: 12px;
			min-height: 44px;
		}

		svg {
			height: 28px;
			width: 28px;
		}

		.updated {
			justify-self: start;
			margin-top: 8px;
		}
	}

	@media (max-width: 480px) {
		details {
			padding: calc(var(--padding) * 0.5);
		}

		summary {
			gap: 8px;
		}

		svg {
			height: 24px;
			width: 24px;
		}

		ul {
			grid-template-columns: 1fr;
		}
	}
</style>
