<script>
	/** @type {{website?: string}} */
	let { website = '' } = $props();
</script>

{#if website}
	<p class="website">
		<a href={website} target="_blank" class="link">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				class="icon"
				viewBox="0 -960 960 960"
				width="24"
				><path
					d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h420v-140H160v140Zm500 0h140v-360H660v360ZM160-460h420v-140H160v140Z" /></svg>
			<span class="url-text">{website}</span>
		</a>
	</p>
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

	.url-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
