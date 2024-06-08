<script>
	import { Location } from '$lib/components';
	
	/** @type {HTMLFormElement}*/
	let form;

	/** @type {Object}*/
	let location;

	$: {
		console.log('location:', location);
	}
</script>

<form
	class="form"
	action="/search"
	bind:this={form}
>
	<Location bind:results={location} />
</form>

<style>
</style>
