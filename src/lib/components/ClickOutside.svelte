<script>
	/** @type {{shouldShowContainer?: boolean, children?: import('svelte').Snippet}} */
	let { shouldShowContainer = $bindable(false), children } = $props();

	/**
	 * Attaches an event listener to detect clicks outside a specified DOM node.
	 * @param {HTMLElement} node - The DOM node to monitor for outside clicks.
	 * @returns {object} An object with a `destroy` method to remove the event listener.
	 */
	function handleOutsideClick(node) {
		window.addEventListener('click', /** @type {EventListener} */ (handleClick));

		/**
		 * Handles a click event to check if the target is outside a specified DOM node.
		 * @param {MouseEvent & {target: HTMLElement}} e - The click event to handle.
		 */
		function handleClick(e) {
			if (
				!node.contains(e.target) &&
				// Add .js-click-outside-toggle to any toggle buttons outside .inner-container
				!e.target.classList.contains('js-click-outside-toggle')
			) {
				node.dispatchEvent(new CustomEvent('outside_click'));
			}
		}

		return {
			destroy() {
				window.removeEventListener('click', /** @type {EventListener} */ (handleClick));
			},
		};
	}
</script>

<div use:handleOutsideClick onoutside_click={() => (shouldShowContainer = false)}>
	<span class="inner-container">
		{@render children?.()}
	</span>
</div>
