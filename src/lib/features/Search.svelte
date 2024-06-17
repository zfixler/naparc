<script>
	import { Location, Settings } from '$lib/components';

	export let denominations;

	/** @type {HTMLFormElement}*/
	let form;

	/** @type {Object}*/
	let location;

	/**
	 * @typedef {Object} SettingItem
	 * @property {boolean} checked - Indicates whether the item is checked.
	 * @property {string} slug - The slug identifier for the item.
	 * @property {string} abbr - The abbreviation for the item.
	 */

	/**
	 * @typedef {Object} Settings
	 * @property {SettingItem[]} included - An array of setting items.
	 * @property {number} radius - Distance to search
	 */

	/** @type {Settings} */
	let settings;
</script>

<form
	class="form"
	action="/search"
	bind:this={form}
>
	<div class="first">
		<Location bind:results={location} />
	</div>
	<div class="second">
		<Settings
			bind:settings
			{denominations}
		/>
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
	}

	.form:has(.input:focus) {
		border-color: var(--accent);
		color: var(--accent);
	}

	.first {
		flex-grow: 1;
	}
</style>
