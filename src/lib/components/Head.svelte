<script>
	import { page } from '$app/state';

	/**
	 * @type {{
	 *   title?: string|null,
	 *   description?: string|null,
	 *   noindex?: boolean,
	 *   image?: string
	 * }}
	 */
	const {
		title = 'NAPARC Search | Find a Confessional Church Near You',
		description = 'Search congregations across the denominations of the North American Presbyterian and Reformed Council by city, address, or postal code.',
		noindex = false,
		image = '/og-image.png',
	} = $props();

	// Query strings produce unlimited variants of the same page, so the canonical
	// is always the bare path.
	const canonical = $derived(new URL(page.url.pathname, page.url.origin).href);
	const imageUrl = $derived(new URL(image, page.url.origin).href);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{/if}

	<meta property="og:site_name" content="NAPARC Search" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="NAPARC Search — find a confessional church near you" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>
