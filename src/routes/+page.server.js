import { getDatabase } from '$lib/server/database';
import { countRegions } from '$lib/utils/regions';

/** @type {import('./$types').PageServerLoad} */
export async function load({ platform }) {
	const db = getDatabase(platform);

	const stats = /** @type {Record<string, any> | null} */ (
		await db.prepare('SELECT * FROM HomeStats WHERE id = 1').first()
	);
	if (stats) {
		return {
			stats: {
				totalCongregations: Number(stats.totalCongregations),
				totalDenominations: Number(stats.totalDenominations),
				totalStates: Number(stats.totalStates),
				totalProvinces: Number(stats.totalProvinces),
			},
		};
	}

	// Preserve correct output between applying the migration and the next scraper run.
	const [statsResult, congregationsResult] = /** @type {any} */ (
		await db.batch([
			db.prepare(`SELECT COALESCE(SUM(count), 0) AS totalCongregations,
				COUNT(CASE WHEN count > 0 THEN 1 END) AS totalDenominations FROM ScrapeLog`),
			db.prepare('SELECT addressLabel FROM Congregation WHERE addressLabel IS NOT NULL'),
		])
	);
	const totalCongregations = Number(statsResult.results[0]?.totalCongregations ?? 0);
	const totalDenominations = Number(statsResult.results[0]?.totalDenominations ?? 0);
	const congregations = congregationsResult.results;

	const { totalStates, totalProvinces } = countRegions(congregations);

	return {
		stats: {
			totalCongregations,
			totalDenominations,
			totalStates,
			totalProvinces,
		},
	};
}
