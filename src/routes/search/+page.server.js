import { fail } from '@sveltejs/kit';
import { getLocationsWithinRadius, paginateResults } from '$lib/utils';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const location = url.searchParams.get('label');
	const lat = url.searchParams.get('lat');
	const lon = url.searchParams.get('lon');
	const radius = url.searchParams.get('rad');
	const pg = url.searchParams.get('pg');
	const excluded = url.searchParams.get('excluded');

	if (lat && lon && radius) {
		const congregations = await getLocationsWithinRadius(lat, lon, radius, excluded);
		const { page, results, totalPages, totalResults } = paginateResults(pg, congregations);

		return {
			location,
			radius,
			congregations: results,
			totalResults,
			page,
			totalPages,
		};
	}

	return fail(400, { message: 'Missing search parameters.' });
}
