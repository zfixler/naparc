import { asBoolean } from '$lib/server/database';

const EARTH_RADIUS_MILES = 3958.7613;

/** @param {number} degrees */
const toRadians = (degrees) => (degrees * Math.PI) / 180;

/**
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 */
export function haversineMiles(lat1, lon1, lat2, lon2) {
	const latDelta = toRadians(lat2 - lat1);
	const lonDelta = toRadians(lon2 - lon1);
	const a =
		Math.sin(latDelta / 2) ** 2 +
		Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(lonDelta / 2) ** 2;
	return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(a));
}

/**
 * @param {Cloudflare.Env['DB']} db
 * @param {string} inputLat
 * @param {string} inputLon
 * @param {string} radius
 * @param {string|null} excluded
 */
export async function getLocationsWithinRadius(db, inputLat, inputLon, radius, excluded) {
	const latitude = Number(inputLat);
	const longitude = Number(inputLon);
	const radiusMiles = Number(radius);
	const latitudeDelta = radiusMiles / 69;
	const longitudeDelta = radiusMiles / Math.max(69 * Math.cos(toRadians(latitude)), 0.01);
	const excludedSlugs = excluded?.split(',').filter(Boolean) ?? [];
	const exclusionSql = excludedSlugs.length
		? ` AND c.denominationSlug NOT IN (${excludedSlugs.map(() => '?').join(', ')})`
		: '';

	const { results } = await db
		.prepare(
			`
			SELECT c.*, p.name AS presbyteryName, p.slug AS presbyterySlug,
				d.name AS denominationName, d.continental AS isContinental
			FROM Congregation c
			LEFT JOIN Presbytery p ON c.presbyteryId = p.id
			LEFT JOIN Denomination d ON c.denominationSlug = d.slug
			WHERE c.lat BETWEEN ? AND ? AND c.lon BETWEEN ? AND ?${exclusionSql}
		`,
		)
		.bind(
			latitude - latitudeDelta,
			latitude + latitudeDelta,
			longitude - longitudeDelta,
			longitude + longitudeDelta,
			...excludedSlugs,
		)
		.all();
	/** @type {Array<Record<string, any>>} */
	const locations = results;

	/** @type {Array<Record<string, any> & { distance: number, isContinental: boolean }>} */
	const matches = locations
		.map((location) => ({
			...location,
			isContinental: asBoolean(location.isContinental),
			distance: haversineMiles(latitude, longitude, Number(location.lat), Number(location.lon)),
		}))
		.filter((location) => location.distance < radiusMiles)
		.sort((a, b) => a.distance - b.distance);
	return matches;
}
