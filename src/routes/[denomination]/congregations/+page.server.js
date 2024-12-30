import { prisma } from '$lib/prisma';
import { paginateResults } from '$lib/utils';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url }) {
	const pg = url.searchParams.get('pg');

	const congregations = await prisma.congregation.findMany({
		where: {
			denominationSlug: params.denomination,
		},
	});
	const denomination = await prisma.denomination.findUnique({
		where: {
			slug: params.denomination,
		},
	});

	const { page, results, totalPages, totalResults } = paginateResults(pg, congregations);

	return { congregations: results, denomination, page, totalPages, totalResults };
}
