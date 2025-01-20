import { prisma } from '$lib/prisma';

/**
 * @typedef {import('@prisma/client').Denomination} BaseDenomination
 */

/**
 * @typedef {Object} DenominationCount
 * @property {number} congregations - The total number of congregations.
 */

/**
 * @typedef {Object} ScrapeLog
 * @property {Date | null} completedAt - The timestamp of when the scrape was completed, can be null.
 */

/**
 * @typedef {BaseDenomination & {
 *   presbyteries: import('@prisma/client').Presbytery[];
 *   _count: DenominationCount;
 *   scrapeLogs: ScrapeLog[];
 * }} ExtendedDenomination
 */

/**
 * @typedef {ExtendedDenomination[]} DenominationList
 */

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	/** @type {DenominationList} */
	const denominations = await prisma.denomination.findMany({
		include: {
			presbyteries: true,
			_count: {
				select: {
					congregations: true,
				},
			},
			scrapeLogs: {
				select: {
					completedAt: true,
				},
			},
		},
		orderBy: [
			{
				presbyteries: {
					_count: 'desc',
				},
			},
			{
				congregations: {
					_count: 'desc',
				},
			},
		],
	});

	return {
		denominations,
	};
}
