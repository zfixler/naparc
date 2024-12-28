import { scrapeManager } from '$lib/manager';
import { prisma } from '$lib/prisma';

/** @type {import('@sveltejs/kit').Load} */
export async function load() {
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
