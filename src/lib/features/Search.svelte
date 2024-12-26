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

		params.append('label', location.label);
		params.append('lon', location.lon);
		params.append('lat', location.lat);
		params.append('rad', settings.radius);

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
		if (location && (settings?.hasSavedSettings || location?.label)) {
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
