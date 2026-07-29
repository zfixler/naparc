<script>
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';

	/** @type {{currentPage?: number, totalPages?: number}} */
	let { currentPage = 1, totalPages = 1 } = $props();

	const isNavigating = $derived(Boolean(navigating.to));

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

<nav class="container" aria-label="Search results pages">
	<ul class="pages">
		<li class="page">
			<button
				class="step"
				onclick={() => navigateToPage(currentPage - 2)}
				disabled={currentPage <= 1 || isNavigating}
				aria-label="Previous page">
				‹ Prev
			</button>
		</li>
		{#each pages as pg (pg)}
			<li class="page">
				{#if pg === '...'}
					<span class="ellipsis">…</span>
				{:else}
					<button
						onclick={() => navigateToPage(Number(pg))}
						class={currentPage === Number(pg) + 1 ? 'current' : ''}
						disabled={currentPage === Number(pg) + 1 || isNavigating}
						aria-current={currentPage === Number(pg) + 1 ? 'page' : undefined}
						aria-label={`Page ${Number(pg) + 1}`}>
						{Number(pg) + 1}
					</button>
				{/if}
			</li>
		{/each}
		<li class="page">
			<button
				class="step"
				onclick={() => navigateToPage(currentPage)}
				disabled={currentPage >= totalPages || isNavigating}
				aria-label="Next page">
				Next ›
			</button>
		</li>
	</ul>
	<p class="context">Page {currentPage} of {totalPages}</p>
</nav>

<style>
	.container {
		display: grid;
		place-items: center;
		padding: var(--padding);
	}

	.pages {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
	}

	.current {
		pointer-events: none;
		background-color: var(--bg-bg);
		color: var(--accent);
	}

	.context {
		font-size: var(--fs-small);
		margin-top: 8px;
		opacity: 0.75;
	}

	button {
		background-color: var(--bg-ff);
		border: none;
		border-radius: var(--brad);
		/* 44px keeps the tap target usable on touch devices */
		min-width: 44px;
		min-height: 44px;
		padding: 0.5rem;
		color: var(--primary);
		cursor: pointer;
		font-family: inherit;
		font-size: inherit;
		font-weight: bold;
		transition: color 0.25s ease;
	}

	button:hover:not(:disabled) {
		color: var(--accent);
	}

	button:disabled {
		cursor: default;
	}

	.step:disabled {
		opacity: 0.4;
	}

	.ellipsis {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 4px;
	}
</style>
