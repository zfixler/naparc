<script>
	import { Head } from '$lib/components';
	import { Denomination } from '$lib/features';
	/** @type {{data: { denominations: Array<import('./+page.server').ExtendedDenomination> }}} */
	let { data } = $props();
	const { denominations } = data;
</script>

<Head title="NAPARC Search | Denominations" />

<p>
	Denominations that are currently supported by this search are indicated with <svg
		xmlns="http://www.w3.org/2000/svg"
		height="14px"
		viewBox="0 -960 960 960"
		width="14px"
		fill="var(--accent)"
		><path
			d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" /></svg
	>.
</p>

{#each denominations as denomination}
	<Denomination {denomination} />
{/each}
