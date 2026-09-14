import { getDatabase } from '$lib/server/database';

/**
 * @typedef {Object} DenominationMeta
 * @property {string} slug - The unique slug identifier of the denomination.
 * @property {string} name - The full name of the denomination.
 * @property {string} id - The unique identifier (UUID) of the denomination.
 * @property {Object} _count - An object containing count-related information.
 * @property {number} _count.congregations - The total number of congregations for the denomination.
 */

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ platform }) {
	const db = getDatabase(platform);
	/** @type {{ results: DenominationMeta[] }} */
	const { results: denominations } = await db
		.prepare(
			`
			SELECT d.slug, d.name, d.id, COUNT(c.id) AS congregationCount
			FROM Denomination d
			LEFT JOIN Congregation c ON c.denominationSlug = d.slug
			GROUP BY d.id, d.slug, d.name
			HAVING COUNT(c.id) > 0
			ORDER BY d.name
		`,
		)
		.all();

	return {
		denominations,
	};
}
