<script>
	import { page } from '$app/stores';
	export let denomination;
	const { id, slug, name, abbr, description, presbyteries, continental } = denomination;
	let shouldShowDetails = $page.url.hash === `#${slug}`;
</script>

<section class="section">
	<button class="button" on:click={() => shouldShowDetails = !shouldShowDetails}>
		<h2 class="denomination" id={slug}>{name}</h2>
		<span class={shouldShowDetails ? 'chevron chevron-open' : 'chevron'}>
			<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>
		</span>
	</button>
	<div class={shouldShowDetails ? 'show' : 'hide'}>
		<p class="description">{description}</p>
		<p class="presbyteries">
			{#if presbyteries.length}
				<b>{continental ? 'Classis:' : 'Presbyteries:'}</b>
				<ul>
					{#each presbyteries as presbytery}
						<li>
							<a href={`/${slug}/${presbytery.slug}`}>{presbytery.name}</a>
						</li>
					{/each}
				</ul>
			{:else}
				There are currently no {continental ? 'classis' : 'presbyteries'} supported for this denomination.
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

	.section {
		background: var(--bg-ff);
		padding: var(--padding);
		margin-top: var(--margin);
		box-shadow: var(--box-shadow);
		border-radius: var(--brad);
	}
	
	.denomination {
		scroll-margin-top: calc(var(--margin) * 2);
		color: var(--primary);
	}
	
	.button {
		display: flex;
		justify-content: space-between;
		background: none;
		outline: none;
		border: none;
		font-family: inherit;
		font-size: var(--fs-h3);
		cursor: pointer;
		width: 100%;
		text-align: start;
	}

	.chevron {
		color: var(--primary);
		transition: transform 250ms ease;
	}

	.chevron-open {
		transform: rotate(90deg);
	}

	.description {
		margin: 12px 0 18px;
	}

	.presbyteries ul {
		list-style-type: none;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		row-gap: 4px;
		margin-top: 16px;
	}

</style>
