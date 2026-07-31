<script>
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';

	/** @type {{currentPage?: number, totalPages?: number, startIndex?: number, endIndex?: number, totalResults?: number}} */
	let {
		currentPage = 1,
		totalPages = 1,
		startIndex = 0,
		endIndex = 0,
		totalResults = 0,
	} = $props();

	const isNavigating = $derived(Boolean(navigating.to));

	/**
	 * Navigate to a specific page
	 * @param {number} pg
	 */
	async function navigateToPage(pg) {
		// Create a new URL instance to avoid mutating the original
		const url = new URL(page.url);
		url.searchParams.set('pg', (pg + 1).toString());

		/*
		 * SvelteKit's default is to jump to the top of the document, which now lands the
		 * reader back on the map — the one thing paging does not change. Suppress it and
		 * go to the top of the list instead, moving focus there so the new page is
		 * announced rather than silently swapped underneath a screen reader.
		 */
		await goto(url.href, { noScroll: true });

		const results = document.getElementById('results');
		if (!results) return;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		results.focus({ preventScroll: true });
		results.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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
	<!-- Scoped to the list, not the map: the map plots all {totalResults} results. -->
	<p class="context">Showing {startIndex}–{endIndex} of {totalResults}</p>
</nav>

<style>
	.container {
		display: grid;
		place-items: center;
		padding: var(--space-lg) 0 var(--space-md);
	}

	.pages {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-3xs);
	}

	.current {
		pointer-events: none;
		background-color: var(--accent);
		border-color: var(--accent);
		color: var(--on-accent);
	}

	.context {
		color: var(--muted);
		font-size: var(--fs-small);
		font-variant-numeric: tabular-nums;
		margin-top: var(--space-xs);
	}

	button {
		background-color: var(--bg-ff);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		min-width: 44px;
		min-height: 44px;
		padding: 0 var(--space-2xs);
		color: var(--secondary);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--fs-small);
		font-variant-numeric: tabular-nums;
		font-weight: var(--fw-semibold);
		transition:
			color var(--speed) var(--ease),
			background-color var(--speed) var(--ease),
			border-color var(--speed) var(--ease);
	}

	button:hover:not(:disabled) {
		background-color: var(--accent-soft);
		border-color: var(--accent-soft);
		color: var(--accent-strong);
	}

	button:disabled {
		cursor: default;
	}

	.step {
		padding: 0 var(--space-xs);
	}

	.step:disabled {
		color: var(--muted);
		opacity: 0.5;
	}

	.ellipsis {
		color: var(--muted);
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0 var(--space-3xs);
	}
</style>
