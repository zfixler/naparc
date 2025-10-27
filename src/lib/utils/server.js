import { getPrisma } from '$lib/prisma';
import { Prisma } from '@prisma/client';
const prisma = getPrisma();

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
