/**
 * Returns a randomly generated UUID in a specified number of chunks.
 * @param {(1|2|3|4|5)} chunkNum - The number of 8 character UUID chunks to return.
 * @returns {string} UUID
 */
export const getUuidChunk = (chunkNum = 5) => {
	return crypto.randomUUID().split('-').slice(0, chunkNum).join('-');
};

/**
 * Attaches an event listener to detect clicks outside a specified DOM node.
 *
 * @param {HTMLElement} node - The DOM node to monitor for outside clicks.
 * @returns {object} An object with a `destroy` method to remove the event listener.
 */
export function handleOutsideClick(node) {
	window.addEventListener('click', /** @type {EventListener} */ (handleClick));

	/**
	 * Handles a click event to check if the target is outside a specified DOM node.
	 * @param {MouseEvent & {target: HTMLElement}} e - The click event to handle.
	 */
	function handleClick(e) {
		if (!node.contains(e.target)) {
			node.dispatchEvent(new CustomEvent('outside_click'));
		}
	}

	return {
		destroy() {
			window.removeEventListener('click', /** @type {EventListener} */ (handleClick));
		},
	};
}

/**
 * Retrieves the regional title associated with the given slug.
 * @param {string} slug - The slug representing the regional affiliation.
 * @returns {string|undefined} The regional title if found, otherwise undefined.
 */
export function getRegionalTitle(slug) {
	/** @type {{ [key: string]: string[] }} */
	const titles = {
		Presbytery: [
			'opc',
			'pca',
			'rpcna'
		],
		Classis: [
			'urcna'
		]
	};

	for (const key in titles) {
		if (titles[key].includes(slug)) return key;
	};
} 