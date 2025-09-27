import { prisma } from '$lib/prisma';

/**
 * @typedef {Object} DenominationMeta
 * @property {string} slug - The unique slug identifier of the denomination.
 * @property {string} name - The full name of the denomination.
 * @property {string} id - The unique identifier (UUID) of the denomination.
 * @property {Object} _count - An object containing count-related information.
 * @property {number} _count.congregations - The total number of congregations for the denomination.
 */

/** @type {import('@sveltejs/kit').Load} */
export async function load() {
	/**
	 * @type {DenominationMeta[]}
	 */
	const denominations = await prisma.denomination.findMany({
		select: {
			slug: true,
			name: true,
			id: true,
			_count: {
				select: {
					congregations: true,
				},
			},
		},
	});

	// Note: Scraping is now handled by a daily cron job at /api/cron/scrape
	// This eliminates connection pool issues and ensures scraping completes
	// even if users close their browsers

	return {
		denominations,
	};
}
