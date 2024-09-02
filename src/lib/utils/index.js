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
 * Get all congregations within a given radius of a provided location.
 * @param {string} inputLat - Latitude
 * @param {string} inputLon - Longitude
 * @param {string} radius - miles
 * @returns {Promise<Array<import("@prisma/client").Congregation>|undefined>}
 */
export async function getLocationsWithinRadius(inputLat, inputLon, radius) {
	try {
		const meters = parseInt(radius) * 1609.34;
		/** @type {Array<import("@prisma/client").Congregation>} */
		const locations = await prisma.$queryRaw`
            SELECT 
                c.*,
                p.name AS "presbyteryName",
                p.slug AS "presbyterySlug",
                d.name AS "denominationName",
                d.continental AS "isContinental",
                (earth_distance(
                    ll_to_earth(c.lat, c.lon), 
                    ll_to_earth(${parseFloat(inputLat)}, ${parseFloat(inputLon)})
                ) / 1609.34) AS distance
            FROM "Congregation" AS c
            LEFT JOIN "Presbytery" AS p ON "presbyteryId" = p.id
            LEFT JOIN "Denomination" AS d ON c."denominationSlug" = d.slug
            WHERE earth_distance(
                      ll_to_earth(c.lat, c.lon), 
                      ll_to_earth(${parseFloat(inputLat)}, ${parseFloat(inputLon)})
                  ) < ${meters}
            ORDER BY distance ASC;
        `;

		return locations;
	} catch (error) {
		console.log('Error getting locations:', error);
	}
}
