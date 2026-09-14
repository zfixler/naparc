import { asBoolean, getDatabase } from '$lib/server/database';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform }) {
	const db = getDatabase(platform);
	const presbytery = await db
		.prepare('SELECT * FROM Presbytery WHERE denominationSlug = ? AND slug = ?')
		.bind(params.denomination, params.presbytery)
		.first();

	if (!presbytery) {
		error(404, 'Not found');
	}
	const [congregations, denomination] = await Promise.all([
		db
			.prepare('SELECT * FROM Congregation WHERE presbyteryId = ? ORDER BY name')
			.bind(presbytery.id)
			.all(),
		db.prepare('SELECT * FROM Denomination WHERE slug = ?').bind(params.denomination).first(),
	]);
	presbytery.congregations = congregations.results;
	presbytery.denomination = denomination;
	if (denomination) denomination.continental = asBoolean(denomination.continental);

	return { presbytery };
}
