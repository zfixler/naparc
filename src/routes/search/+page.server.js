import { fail } from '@sveltejs/kit';
import { getLocationsWithinRadius } from '$lib/utils';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
	const location = url.searchParams.get('label');
	const lat = url.searchParams.get('lat');
	const lon = url.searchParams.get('lon');
	const radius = url.searchParams.get('rad');

	if (lat && lon && radius) {
		const congregations = await getLocationsWithinRadius(lat, lon, radius);
		return {
			location,
			radius,
			congregations,
		};
	}
	
	return fail(400, { message: 'Missing search parameters.' });
}