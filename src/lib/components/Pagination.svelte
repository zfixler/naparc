<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	/** @type {{currentPage?: number, totalPages?: number}} */
	let { currentPage = 1, totalPages = 1 } = $props();

	/**
	 * Navigate to a specific page
	 * @param {number} pg
	 */
	function navigateToPage(pg) {
		// Create a new URL instance to avoid mutating the original
		const url = new URL(page.url);
		url.searchParams.set('pg', (pg + 1).toString());
		goto(url.href);
	}

	// Memoize the pages calculation to avoid unnecessary recalculations
	const pages = $derived.by(() => {
		const pageList = [];
		const range = 1; // Number of pages to show around the current page

		for (let i = 0; i < totalPages; i++) {
			if (
				i === 0 || // First page
				i === totalPages - 1 || // Last page
				(i >= currentPage - range && i <= currentPage + range) // Pages around the current page
			) {
				pageList.push(i);
			} else if (
				(i === currentPage - range - 1 && currentPage - range > 1) || // Ellipsis before the current range
				(i === currentPage + range + 1 && currentPage + range < totalPages - 2) // Ellipsis after the current range
			) {
				pageList.push('...');
			}
		}

		return pageList;
	});
</script>

<div class="container">
	<ul class="pages">
		{#each pages as pg (pg)}
			<li class="page">
				{#if pg === '...'}
					<span class="ellipsis">...</span>
				{:else}
					<button
						onclick={() => navigateToPage(Number(pg))}
						class={currentPage === Number(pg) + 1 ? 'current' : ''}
						disabled={currentPage === Number(pg) + 1}
						aria-label={`Page ${Number(pg) + 1}`}>
						{Number(pg) + 1}
					</button>
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
		background-color: var(--bg-bg);
	}

	button {
		background-color: var(--bg-ff);
		border: none;
		padding: 0.5rem;
		color: var(--primary);
		cursor: pointer;
		font-weight: bold;
	}
</style>
