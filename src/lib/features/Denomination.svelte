<script>
	import { page } from '$app/stores';
	export let denomination;
	const { slug, name, description, presbyteries, continental } = denomination;
	let shouldShowDetails = $page.url.hash === `#${slug}`;
</script>

<details
	class="section"
	open={shouldShowDetails}
>
	<summary class="button">
		<h2
			class="denomination"
			id={slug}
		>
			{name}
			{#if presbyteries.length}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					height="24px"
					viewBox="0 -960 960 960"
					width="24px"
					class="check-icon"
					fill="currentColor"
					><path
						d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
					/></svg
				>
			{/if}
		</h2>
		<span class="chevron">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24px"
				viewBox="0 -960 960 960"
				width="24px"
				fill="currentColor"
				><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" /></svg
			>
		</span>
	</summary>
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
			There are currently no {continental ? 'classis' : 'presbyteries'} supported
			for this denomination.
		{/if}
	</p>
</details>

<style>
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
		display: flex;
		align-items: center;
		gap: 16px;
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

	details[open] .chevron {
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

	.check-icon {
		color: var(--accent);
	}
</style>
