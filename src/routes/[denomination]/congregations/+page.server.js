import { getPrisma } from '$lib/prisma';
import { paginateResults } from '$lib/utils';
import { error } from '@sveltejs/kit';
const prisma = getPrisma();

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

	if (!denomination) {
		error(404, 'Not found');
	}

	const { page, results, totalPages, totalResults } = paginateResults(pg, congregations);

	return { congregations: results, denomination, page, totalPages, totalResults };
}
