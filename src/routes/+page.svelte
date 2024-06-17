<script>
	import { Search } from '$lib/features';
	export let data;

</script>

<header class="header">
	<h1 class="title">NAPARC Search</h1>
	<Search denominations={data.denominations}/>
</header>

<style>
	.header {
		display: flex;
		flex-direction: column;
		gap: 16px;
    margin: 32px;
	}
</style>
