<script>
	/** @type {{contact?: string, pastor?: string}} */
	let { contact = '', pastor = '' } = $props();
	const multiplePastors =
		typeof pastor === 'string' && pastor.includes('<br>')
			? pastor
					.split('<br>')
					.map((str) => `Pastor ${str}`)
					.join('<br>')
			: null;
</script>

<p class={['contact', 'link', { multiplePastors }]}>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		class="icon"
		height="24"
		viewBox="0 -960 960 960"
		width="24"
		><path
			d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z" /></svg>
	{#if multiplePastors}
		<!-- eslint-disable-next-line -->
		{@html multiplePastors}
	{:else if pastor}
		Pastor {pastor}
	{:else if contact}
		{contact}
	{:else}
		N/A
	{/if}
</p>

<style>
	.icon {
		fill: currentColor;
		flex-shrink: 0;
	}

	.link {
		display: flex;
		align-items: center;
		gap: 8px;
		max-width: 100%;
	}

	.multiplePastors {
		align-items: start;
	}
</style>
