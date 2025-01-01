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
		return page.url.href;
	}

	function getPages() {
		const pages = [];
		const range = 1; // Number of pages to show around the current page

		for (let i = 0; i < totalPages; i++) {
			if (
				i === 0 || // First page
				i === totalPages - 1 || // Last page
				(i >= currentPage - range && i <= currentPage + range) // Pages around the current page
			) {
				pages.push(i);
			} else if (
				(i === currentPage - range - 1 && currentPage - range > 1) || // Ellipsis before the current range
				(i === currentPage + range + 1 && currentPage + range < totalPages - 2) // Ellipsis after the current range
			) {
				pages.push('...');
			}
		}

		return pages; // Remove duplicate ellipses
	}
</script>

<div class="container">
	<ul class="pages">
		<!-- eslint-disable-next-line -->
		{#each getPages() as pg}
			<li class="page">
				{#if pg === '...'}
					<span class="ellipsis">...</span>
				{:else}
					<a
						href={getPageUrl(Number(pg))}
						class={currentPage === Number(pg) + 1 ? 'current' : ''}
						aria-disabled={currentPage === Number(pg) + 1}
						aria-label={`Page ${Number(pg) + 1}`}>
						{Number(pg) + 1}
					</a>
				{/if}
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
