<script>
	import { page } from '$app/state';
	/** @type {{currentPage?: number, totalPages?: number}} */
	let { currentPage = 1, totalPages = 1 } = $props();

	/**
	 * Get the url for each page
	 * @param {number} pg
	 */
	function getPageUrl(pg) {
		if (page.url.searchParams.has('pg')) {
			page.url.searchParams.set('pg', (pg + 1).toString());
		} else {
			page.url.searchParams.append('pg', (pg + 1).toString());
		}
		return `/${page.url.href}`;
	}
</script>

<div class="container">
	<ul class="pages">
		<!-- eslint-disable-next-line -->
		{#each Array(totalPages) as _, pg}
			<li class="page">
				<a
					href={getPageUrl(pg)}
					class={currentPage === pg + 1 ? 'current' : ''}
					aria-disabled={currentPage === pg + 1}>
					{pg + 1}
				</a>
			</li>
		{/each}
	</ul>
</div>

<style>
	.container {
		display: grid;
		place-items: center;
		padding: var(--padding);
	}
	.pages {
		list-style: none;
		display: flex;
		gap: 8px;
	}

	.current {
		pointer-events: none;
		text-decoration: underline;
	}
</style>
