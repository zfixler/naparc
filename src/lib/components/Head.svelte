<script>
	/** @type {{title?: string|null, description?: string|null}} */
	const { title = 'NAPARC Search', description = 'Search and explore NAPARC churches near you.' } =
		$props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
</svelte:head>
