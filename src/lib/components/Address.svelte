<script>
	/** @type {{address?: string, addressLabel?: string, name?: string}} */
	let { address = '', addressLabel = '', name = '' } = $props();
	const url = `https://www.google.com/maps/search/?api=1&query=${encodeURI(`${name} ${address}`)}`;
</script>

{#if address}
	<address class="address">
		<a href={url} target="_blank" class="link">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="icon map"
				height="24"
				viewBox="0 -960 960 960"
				width="24"
				><path
					d="m600-120-240-84-186 72q-20 8-37-4.5T120-170v-560q0-13 7.5-23t20.5-15l212-72 240 84 186-72q20-8 37 4.5t17 33.5v560q0 13-7.5 23T812-192l-212 72Zm-40-98v-468l-160-56v468l160 56Zm80 0 120-40v-474l-120 46v468Zm-440-10 120-46v-468l-120 40v474Zm440-458v468-468Zm-320-56v468-468Z" /></svg>
			<!-- eslint-disable-next-line -->
			{@html addressLabel}
		</a>
	</address>
{/if}

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

	.map {
		align-self: flex-start;
	}
</style>
