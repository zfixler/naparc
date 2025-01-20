import { scrapeManager } from '$lib/manager';
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

	denominations.forEach(({ slug }) =>
		scrapeManager.checkAndScrape(slug).catch((error) => console.error(error)),
	);

	return {
		denominations: denominations.filter((denomination) => denomination._count.congregations),
	};
}
