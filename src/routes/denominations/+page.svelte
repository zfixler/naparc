<script>
	import { Denomination } from '$lib/features';
	/** @type {{data: any}} */
	let { data } = $props();
	const { denominations } = data;
</script>

{#each denominations as denomination}
	<Denomination {denomination} />
{/each}
