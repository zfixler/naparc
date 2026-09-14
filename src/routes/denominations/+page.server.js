import { asBoolean, asDate, getDatabase } from '$lib/server/database';

/**
 * @typedef {Record<string, any>} BaseDenomination
 */

/**
 * @typedef {Object} DenominationCount
 * @property {number} congregations - The total number of congregations.
 */

/**
 * @typedef {Object} ScrapeLog
 * @property {Date | null} completedAt - The timestamp of when the scrape was completed, can be null.
 */

/**
 * @typedef {BaseDenomination & {
 *   presbyteries: Array<Record<string, any>>;
 *   _count: DenominationCount;
 *   scrapeLogs: ScrapeLog[];
 * }} ExtendedDenomination
 */

/**
 * @typedef {ExtendedDenomination[]} DenominationList
 */

/** @type {import('./$types').PageServerLoad} */
export async function load({ platform }) {
	const db = getDatabase(platform);
	/** @type {DenominationList} */
	const [denominationRows, presbyteryRows, logRows] = /** @type {any} */ (
		await db.batch([
			db.prepare(`
			SELECT d.*, COUNT(p.id) AS presbyteryCount, COALESCE(s.count, 0) AS congregationCount
			FROM Denomination d
			LEFT JOIN Presbytery p ON p.denominationSlug = d.slug
			LEFT JOIN ScrapeLog s ON s.denominationSlug = d.slug
			GROUP BY d.id, s.count
			ORDER BY presbyteryCount DESC, congregationCount DESC
		`),
			db.prepare('SELECT * FROM Presbytery ORDER BY name'),
			db.prepare('SELECT denominationSlug, completedAt FROM ScrapeLog'),
		])
	);
	const denominations = denominationRows.results.map(
		(/** @type {Record<string, any>} */ denomination) => ({
			...denomination,
			continental: asBoolean(denomination.continental),
			presbyteries: presbyteryRows.results.filter(
				(/** @type {Record<string, any>} */ presbytery) =>
					presbytery.denominationSlug === denomination.slug,
			),
			_count: { congregations: Number(denomination.congregationCount) },
			scrapeLogs: logRows.results
				.filter(
					(/** @type {Record<string, any>} */ log) => log.denominationSlug === denomination.slug,
				)
				.map((/** @type {Record<string, any>} */ log) => ({
					completedAt: asDate(log.completedAt),
				})),
		}),
	);

	return {
		denominations,
	};
}
