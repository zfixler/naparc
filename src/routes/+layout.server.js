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

	// Trigger scraping for one denomination at a time to prevent overwhelming the connection pool
	// Process them sequentially with a small delay to avoid concurrent database operations
	setTimeout(async () => {
		for (const { slug } of denominations) {
			try {
				await scrapeManager.checkAndScrape(slug);
				// Small delay between denominations to prevent connection pool exhaustion
				await new Promise((resolve) => setTimeout(resolve, 1000));
			} catch (error) {
				console.error(
					`Failed to scrape ${slug}:`,
					error instanceof Error ? error.message : 'Unknown error',
				);
			}
		}
	}, 100); // Small initial delay to ensure response is sent first

	return {
		denominations,
	};
}
