import { getDatabase, asBoolean } from '$lib/server/database';
import { paginateResults } from '$lib/utils';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url, platform }) {
	const db = getDatabase(platform);
	const pg = url.searchParams.get('pg');

	const [congregationResult, denominationResult] = await db.batch([
		db
			.prepare('SELECT * FROM Congregation WHERE denominationSlug = ? ORDER BY name')
			.bind(params.denomination),
		db.prepare('SELECT * FROM Denomination WHERE slug = ?').bind(params.denomination),
	]);
	const congregations = congregationResult.results;
	/** @type {Record<string, any> | undefined} */
	const denomination = /** @type {Record<string, any> | undefined} */ (
		denominationResult.results[0]
	);

	if (!denomination) {
		error(404, 'Not found');
	}
	denomination.continental = asBoolean(denomination.continental);

	const { page, results, totalPages, totalResults } = paginateResults(pg, congregations);

	return { congregations: results, denomination, page, totalPages, totalResults };
}
