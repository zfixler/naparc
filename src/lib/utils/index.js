import { Prisma } from '@prisma/client';
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
 * @param {string|null} excluded
 * @returns {Promise<Array<import("@prisma/client").Congregation> | undefined>}
 */
export async function getLocationsWithinRadius(inputLat, inputLon, radius, excluded) {
	try {
		const meters = parseInt(radius) * 1609.34;
		const exclude = excluded ? excluded.split(',') : null;

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
			${exclude ? Prisma.sql`AND c."denominationSlug" NOT IN (${Prisma.join(exclude)})` : Prisma.empty}
            ORDER BY distance ASC;
        `;

		return locations;
	} catch (error) {
		console.log('Error getting locations:', error);
	}
}

/**
 * Paginates an array of results based on the provided page number.
 * @param {string | null} pg - The current page number, which will be parsed as an integer. Defaults to 1 if not provided.
 * @param {Array<any>} [results] - The array of results to paginate. Defaults to an empty array if no results are provided.
 * @returns {{results: Array<any>;page: number;totalResults: number;totalPages: number}} An object containing the paginated results details.
 */
export function paginateResults(pg, results = []) {
	const page = pg ? parseInt(pg) : 1;
	const pageSize = 10;
	const offest = (page - 1) * pageSize;
	const totalResults = results.length;
	const totalPages = Math.ceil(totalResults / pageSize);

	return {
		results: results.slice(offest, offest + pageSize),
		page,
		totalResults,
		totalPages,
	};
}

/**
 * Calculates the range of results currently being viewed on the given page.
 *
 * @param {number} currentPage - The current page number.
 * @param {number} totalResults - The total number of results available.
 * @returns {{ startIndex: number, endIndex: number }} An object containing the start and end indices of the results being viewed.
 */
export function calculateViewedResults(currentPage = 1, totalResults = 1) {
	const resultsPerPage = 10;
	const startIndex = (currentPage - 1) * resultsPerPage + 1;
	const endIndex = Math.min(currentPage * resultsPerPage, totalResults);
	return {
		startIndex,
		endIndex,
	};
}
