<script>
	import { goto } from '$app/navigation';
	import { Location, Settings } from '$lib/components';

	/** @type {{denominations: any}} */
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

	/** @type {Settings} */
	let settings = $state({
		included: [],
		radius: '',
		hasSavedSettings: false,
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

		const label = location.label ? location.label : currentParams.get('label');

		if (!label) return;

		const lon = location.lon || currentParams.get('lon') || '';
		const lat = location.lat || currentParams.get('lat') || '';
		const rad = settings.radius || currentParams.get('rad') || '';

		params.append('label', label);
		params.append('lon', lon);
		params.append('lat', lat);
		params.append('rad', rad);

		const excluded = settings.included.filter((item) => !item.checked).map((item) => item.slug);

		if (excluded.length) {
			params.append('excluded', excluded.join(','));
		}

		url.search = params.toString();
		goto(url.href);
		settings.hasSavedSettings = false;
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
		<Location bind:results={location} />
	</div>
	<div class="second">
		<Settings bind:settings {denominations} />
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
