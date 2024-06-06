/**
 * Returns a randomly generated UUID in a specified number of chunks.
 * @param {(1|2|3|4|5)} chunkNum - The number of 8 character UUID chunks to return.
 * @returns {string} UUID
 */
export const getUuidChunk = (chunkNum = 5) => {
	return crypto.randomUUID().split('-').slice(0, chunkNum).join('-');
};

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
			'urcna',
			'rcus'
		]
	};

	for (const key in titles) {
		if (titles[key].includes(slug)) return key;
	};
} 
