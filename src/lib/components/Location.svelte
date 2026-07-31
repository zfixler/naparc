<script>
	import { ClickOutside } from '$lib/components';
	import { slide } from 'svelte/transition';

	/** @type {{results: any, options: any, shouldShowMenu: boolean, selectedLabel: string}} */
	let {
		results = $bindable(),
		options = $bindable(),
		shouldShowMenu = $bindable(),
		selectedLabel = $bindable(''),
	} = $props();

	/** @type {NodeJS.Timeout|number|undefined} */
	let debounceTimer;
	/**
	 * @type {AbortController | null}
	 */
	let currentRequest;

	let isSearching = $state(false);

	/** Index of the keyboard-highlighted option; -1 when none is active. */
	let activeIndex = $state(-1);

	const listboxId = 'location-listbox';
	const activeOptionId = $derived(
		activeIndex > -1 && options[activeIndex]
			? `location-option-${options[activeIndex].id}`
			: undefined,
	);
	/**
	 * @typedef {Object} ResultObject
	 * @property {string} formatted - Formatted location name
	 * @property {number} lon - Location longitude
	 * @property {number} lat - Location latitude
	 * @property {string} place_id - Unique identifier
	 */

	/**
	 * @typedef {Object} OptionObject
	 * @property {string} id - Unique identifier
	 * @property {object} body - Option body
	 * @property {number} body.lon - Location longitude
	 * @property {number} body.lat - Location latitude
	 * @property {string} body.label - Formatted location
	 */

	/**
	 * Format menu options from API data
	 * @param {Object} data
	 * @param {Array<ResultObject>} data.results
	 */
	function formatOptions({ results }) {
		return results.map(({ formatted: label, lat, lon, place_id }) => {
			const body = {
				lat,
				lon,
				label,
			};
			return { id: place_id, body };
		});
	}

	/**
	 * Fetch locations from API on search input
	 * @param {Event & { currentTarget: EventTarget & HTMLInputElement; }} e
	 */
	async function fetchLocationOptions(e) {
		if (debounceTimer) clearTimeout(debounceTimer);
		if (currentRequest) currentRequest.abort();

		debounceTimer = setTimeout(async () => {
			// Return if e.target is not correct type
			if (!(e.target instanceof HTMLInputElement)) return;

			const input = e.target.value.trim();

			// Return if less than three characters
			if (input.length < 3) {
				options = [];
				shouldShowMenu = false;
				isSearching = false;
				return;
			}

			const controller = new AbortController();
			currentRequest = controller;
			isSearching = true;

			try {
				// Fetch locations
				const url = `/api/geocode?input=${encodeURIComponent(input)}`;

				const response = await fetch(url, { signal: controller.signal });
				const data = await response.json();

				// Store options;
				options = formatOptions(data);

				// Show options
				activeIndex = -1;
				shouldShowMenu = true;
			} catch (err) {
				// A superseded keystroke aborts the in-flight request; that is not an error
				if (err instanceof DOMException && err.name === 'AbortError') return;
				console.error(err);
				options = [];
				shouldShowMenu = true;
			} finally {
				// Only the newest request owns the spinner
				if (currentRequest === controller) {
					currentRequest = null;
					isSearching = false;
				}
			}
		}, 300);
	}

	/**
	 * Handle when an option is selected from the menu
	 * @param {OptionObject} option
	 */
	function handleOptionSelection(option) {
		// Close menu
		shouldShowMenu = false;
		activeIndex = -1;
		// Reflect the choice in the input, then attach results to trigger the search
		selectedLabel = option.body.label;
		results = option.body;
	}

	/**
	 * Drive the option list from the keyboard while focus stays in the input,
	 * per the ARIA combobox pattern.
	 * @param {KeyboardEvent} e
	 */
	function handleKeydown(e) {
		if (e.key === 'Escape') {
			shouldShowMenu = false;
			activeIndex = -1;
			return;
		}

		if (e.key === 'Tab') {
			shouldShowMenu = false;
			return;
		}

		if (!shouldShowMenu || !options.length) return;

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = (activeIndex + 1) % options.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = activeIndex <= 0 ? options.length - 1 : activeIndex - 1;
		} else if (e.key === 'Home') {
			e.preventDefault();
			activeIndex = 0;
		} else if (e.key === 'End') {
			e.preventDefault();
			activeIndex = options.length - 1;
		} else if (e.key === 'Enter' && activeIndex > -1) {
			// Only intercept Enter when an option is highlighted; otherwise let the form submit
			e.preventDefault();
			handleOptionSelection(options[activeIndex]);
		}
	}
</script>

<div class="location-search">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		height="24"
		viewBox="0 -960 960 960"
		width="24"
		class="glass"
		><path
			d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"
			fill="currentColor" /></svg>
	<input
		class="input"
		type="text"
		name="loc"
		placeholder="Start typing a location..."
		aria-label="Search by city, address, or postal code"
		role="combobox"
		autocomplete="off"
		aria-autocomplete="list"
		aria-expanded={shouldShowMenu}
		aria-controls={listboxId}
		aria-activedescendant={activeOptionId}
		onkeydown={handleKeydown}
		oninput={fetchLocationOptions}
		bind:value={selectedLabel} />
	{#if isSearching}
		<span class="spinner" aria-hidden="true"></span>
	{/if}
</div>
<div class="visually-hidden" role="status" aria-live="polite">
	{#if isSearching}
		Searching for locations…
	{:else if shouldShowMenu}
		{options.length} location{options.length === 1 ? '' : 's'} found.
	{/if}
</div>
{#if shouldShowMenu}
	<ClickOutside bind:shouldShowContainer={shouldShowMenu}>
		<div class="wrapper">
			<div
				class="menu"
				id={listboxId}
				role="listbox"
				aria-label="Location suggestions"
				in:slide={{ duration: 250 }}>
				{#if options.length === 0}
					<div class="option empty">No locations found.</div>
				{:else}
					{#each options as option, i (option.id)}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<div
							id="location-option-{option.id}"
							class="option"
							class:active={i === activeIndex}
							role="option"
							tabindex="-1"
							aria-selected={i === activeIndex}
							onmousemove={() => (activeIndex = i)}
							onclick={() => handleOptionSelection(option)}>
							{option.body.label}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</ClickOutside>
{/if}

<style>
	.location-search {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		transition: color var(--speed) var(--ease);
		min-height: 44px;
	}

	.glass {
		color: inherit;
		flex-shrink: 0;
		height: 20px;
		width: 20px;
	}

	.input {
		border: none;
		color: var(--primary);
		font-family: inherit;
		font-size: var(--fs-regular);
		letter-spacing: 0.01em;
		min-width: 0;
		outline: none;
		width: 100%;
	}

	.input::placeholder {
		color: var(--muted);
		opacity: 1;
	}

	.location-search,
	.input {
		background-color: transparent;
	}

	.spinner {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		border: 2px solid var(--line-strong);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.spinner {
			animation-duration: 2s;
		}
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.wrapper {
		display: flex;
		justify-content: center;
		left: 0;
		position: absolute;
		right: 0;
		top: calc(100% + var(--space-2xs));
		z-index: 1000;
	}

	.menu {
		width: 100%;
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		background-color: var(--bg-ff);
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: var(--space-3xs);
	}

	.option {
		background: none;
		border: none;
		border-radius: var(--radius-xs);
		text-align: left;
		color: var(--primary);
		padding: var(--space-xs) var(--space-sm);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--fs-regular);
		line-height: var(--lh-snug);
		transition:
			background-color 120ms var(--ease),
			color 120ms var(--ease);
	}

	.option.empty {
		cursor: default;
		color: var(--muted);
	}

	.option:hover,
	.option.active {
		background-color: var(--accent-soft);
		color: var(--accent-strong);
	}

	.option.empty:hover {
		background-color: transparent;
		color: var(--muted);
	}
</style>
