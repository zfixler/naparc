import { prisma } from '$lib/prisma';

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
		Presbytery: ['opc', 'pca', 'rpcna'],
		Classis: ['urcna', 'rcus'],
	};

	for (const key in titles) {
		if (titles[key].includes(slug)) return key;
	}
}

/**
 * Get all congregations within a given radius of a provided location.
 * @param {string} lat - Latitude
 * @param {string} lon - Longitude
 * @param {string} radius - miles
 * @returns {Promise<Array<import("@prisma/client").Congregation>|undefined>}
 */
export async function getLocationsWithinRadius(lat, lon, radius) {
	try {
		const meters = parseInt(radius) * 1609.34;
		/** @type {Array<import("@prisma/client").Congregation>} */
		const locations =
			await prisma.$queryRaw`SELECT *, earth_distance(ll_to_earth(lat, lon), ll_to_earth(${parseFloat(
				lat
			)}, ${parseFloat(
				lon
			)})) AS distance FROM "Congregation" WHERE earth_distance(ll_to_earth(lat, lon), ll_to_earth(${parseFloat(
				lat
			)}, ${parseFloat(lon)})) < ${meters};`;
		return locations.map((location) => {
			location.distance =
				location.distance !== null ? location.distance / 1609.34 : null;
			return location;
		});
	} catch (error) {
		console.log('Error getting locations:', location);
	}
}
