<script>
	/** @type {{email?: string}} */
	let { email = '' } = $props();

	// Split the email into parts
	const emailParts = $derived(email?.split('@') || []);
	const user = $derived(emailParts[0]);
	const domain = $derived(emailParts[1]);

	/**
	 * Get the email address
	 * @param {MouseEvent} e
	 */
	function getEmail(e) {
		e.preventDefault();
		// Create a mailto link
		window.location.href = `mailto:${user}@${domain}`;
	}
</script>

{#if email}
	<p class="email">
		<a href={`mailto:${user}`} onclick={getEmail} class="link">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				height="24"
				viewBox="0 -960 960 960"
				class="icon"
				width="24"
				><path
					d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z" /></svg>
			<span><span>{user}</span><span>@</span><span>{domain}</span></span>
		</a>
	</p>
{/if}

<style>
	.icon {
		fill: currentColor;
		flex-shrink: 0;
	}

	.link {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		max-width: 100%;
	}
</style>
