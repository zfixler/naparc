import { PAGE_SIZE, paginateResults } from '$lib/utils';
import { getLocationsWithinRadius } from '$lib/utils/server';
import { redirect } from '@sveltejs/kit';

/**
 * @typedef {Object} MapPin
 * @property {string} id - Congregation id, used as the in-page anchor target.
 * @property {string|null} name
 * @property {number} lat
 * @property {number} lon
 * @property {string|null} address
 * @property {string} denominationSlug
 * @property {number} page - Which results page this congregation's card lives on.
 */

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

	/*
	 * The map needs the whole result set, not the current page — otherwise it zooms to fit
	 * ten pins out of a possible hundred and stops working as a spatial overview. The rows
	 * are already in memory, so this costs no extra query; trim them to just what a marker
	 * and its popup need (~200 bytes each) rather than shipping full congregation records.
	 */
	/** @type {MapPin[]} */
	const pins = (congregations ?? []).flatMap(
		({ id, name, lat, lon, address, denominationSlug }, i) =>
			// `page` is derived from the index in the full sorted list, before any filtering,
			// so a pin's link always lands on the page its card is actually rendered on.
			lat === null || lon === null
				? []
				: [{ id, name, lat, lon, address, denominationSlug, page: Math.floor(i / PAGE_SIZE) + 1 }],
	);

	return {
		location,
		radius,
		lat,
		lon,
		congregations: results,
		pins,
		totalResults,
		page,
		totalPages,
	};
}
