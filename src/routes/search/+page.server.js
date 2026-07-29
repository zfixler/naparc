import { paginateResults } from '$lib/utils';
import { getLocationsWithinRadius } from '$lib/utils/server';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const location = url.searchParams.get('label');
	const lat = url.searchParams.get('lat');
	const lon = url.searchParams.get('lon');
	const radius = url.searchParams.get('rad');
	const pg = url.searchParams.get('pg');
	const excluded = url.searchParams.get('excluded');

	const isValidCoordinate = (/** @type {string|null} */ value, /** @type {number} */ limit) =>
		value !== null &&
		value !== '' &&
		Number.isFinite(Number(value)) &&
		Math.abs(Number(value)) <= limit;

	// A search with no usable coordinates has nothing to render. Send the visitor back to
	// the search box rather than rendering a page that reads as "no congregations found".
	if (!isValidCoordinate(lat, 90) || !isValidCoordinate(lon, 180) || !Number(radius)) {
		redirect(303, '/');
	}

	const congregations = await getLocationsWithinRadius(
		/** @type {string} */ (lat),
		/** @type {string} */ (lon),
		/** @type {string} */ (radius),
		excluded,
	);

	const { page, results, totalPages, totalResults } = paginateResults(pg, congregations);

	return {
		location,
		radius,
		lat,
		lon,
		congregations: results,
		totalResults,
		page,
		totalPages,
	};
}
