<script>
	/** @type {{data: Record<string, any>}} */
	let { data } = $props();

	/*
	 * Congregation names and addresses are scraped, so a stray closing script tag
	 * in the data would otherwise end this block early and inject markup. Escaping
	 * every angle bracket keeps the JSON valid while making that impossible.
	 */
	const json = $derived(JSON.stringify(data).split('<').join('\\u003c'));
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html '<script type="application/ld+json">' + json + '<' + '/script>'}
</svelte:head>
