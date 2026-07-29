<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Location, Settings } from '$lib/components';

	/** @type {{denominations: Array<import('../../routes/+layout.server.js').DenominationMeta>}} */
	let { denominations } = $props();

	/** @type {HTMLFormElement|undefined}*/
	let form = $state();

	/**
	 * @typedef {Object} Location
	 * @property {string} label - The label for the location.
	 * @property {string} lon - The longitude of the location.
	 * @property {string} lat - The latitude of the location.
	 */

	/** @type {Location}*/
	let location = $state({
		label: '',
		lon: '',
		lat: '',
	});

	/**
	 * @type {any[]}
	 */
	let options = $state([]);

	let shouldShowMenu = $state(false);

	/**
	 * @typedef {Object} SettingItem
	 * @property {boolean} checked - Indicates whether the item is checked.
	 * @property {string} slug - The slug identifier for the item.
	 * @property {string} abbr - The abbreviation for the item.
	 */

	/**
	 * @typedef {Object} Settings
	 * @property {SettingItem[]} included - An array of setting items.
	 * @property {string} radius - Distance to search
	 * @property {boolean} hasSavedSettings
	 */

	/**
	 * Read the form's state out of the query string, so the controls always describe the
	 * search that is actually on screen.
	 * @param {URLSearchParams} params
	 */
	function readSearchState(params) {
		const excluded = new Set((params.get('excluded') || '').split(',').filter(Boolean));

		return {
			label: params.get('label') || '',
			radius: params.get('rad') || '25',
			included: denominations.map(({ slug, name: abbr }) => ({
				abbr,
				slug,
				checked: !excluded.has(slug),
			})),
		};
	}

	const initial = readSearchState(page.url.searchParams);

	let selectedLabel = $state(initial.label);

	/** @type {Settings} */
	let settings = $state({
		included: initial.included,
		radius: initial.radius,
		hasSavedSettings: false,
	});

	/**
	 * Re-sync after every navigation. Without this the inputs fall back to their defaults,
	 * so the settings panel would claim "all denominations, 25 miles" regardless of what
	 * the results were actually filtered by — and re-submitting would widen the search.
	 * The initial values above are set synchronously so SSR markup matches too.
	 */
	$effect(() => {
		const next = readSearchState(page.url.searchParams);

		selectedLabel = next.label;
		settings.radius = next.radius;
		settings.included = next.included;
		settings.hasSavedSettings = false;
		location = { label: '', lon: '', lat: '' };
	});

	/**
	 *
	 * @param {Event & { currentTarget: EventTarget & HTMLFormElement;}} e
	 */
	function handleSubmit(e) {
		e.preventDefault();

		const url = new URL(e.currentTarget.action);
		const params = new URLSearchParams();
		const currentParams = new URLSearchParams(window.location.search);

		const topOption = options[0]?.body || {};
		const label = location.label || topOption.label || currentParams.get('label');

		if (!label) return;

		const lon = location.lon || topOption.lon || currentParams.get('lon') || '';
		const lat = location.lat || topOption.lat || currentParams.get('lat') || '';
		const rad = settings.radius || currentParams.get('rad') || '';

		params.append('label', label);
		params.append('lon', lon);
		params.append('lat', lat);
		params.append('rad', rad);

		const excluded = settings.included.filter((item) => !item.checked).map((item) => item.slug);

		if (excluded.length) {
			params.append('excluded', excluded.join(','));
		}

		params.append('pg', '1');

		settings.hasSavedSettings = false;
		shouldShowMenu = false;

		url.search = params.toString();
		goto(url.href);
	}

	const triggerSubmit = () => {
		if (form) {
			const event = new Event('submit', {
				bubbles: true,
				cancelable: true,
			});
			form.dispatchEvent(event);
		}
	};

	$effect(() => {
		if (location && (settings.hasSavedSettings || location.label)) {
			triggerSubmit();
		}
	});
</script>

<form class="form" action="/search" bind:this={form} onsubmit={handleSubmit}>
	<div class="first">
		<Location bind:results={location} bind:selectedLabel bind:options bind:shouldShowMenu />
	</div>
	<div class="second">
		<Settings bind:settings />
	</div>
</form>

<style>
	.form {
		align-items: start;
		background-color: var(--bg-ff);
		border-radius: var(--brad);
		border: 2px solid var(--gray-1);
		box-shadow: var(--box-shadow);
		color: var(--gray-3);
		display: flex;
		gap: 4px;
		padding: 10px;
		transition: border-color 0.25s ease;
		width: 100%;
		position: relative;
	}

	:global(.form:has(.input:focus)) {
		border-color: var(--accent);
		color: var(--accent);
	}

	.first {
		flex-grow: 1;
	}
</style>
