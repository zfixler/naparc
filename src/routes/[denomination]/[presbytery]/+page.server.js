import { asBoolean, getDatabase } from '$lib/server/database';
import { PAGE_SIZE } from '$lib/utils';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url, platform }) {
	const db = getDatabase(platform);
	const pg = url.searchParams.get('pg');
	const presbytery = await db
		.prepare('SELECT * FROM Presbytery WHERE denominationSlug = ? AND slug = ?')
		.bind(params.denomination, params.presbytery)
		.first();

	if (!presbytery) {
		error(404, 'Not found');
	}
	const totalResults = Number(presbytery.congregationCount);
	const totalPages = Math.ceil(totalResults / PAGE_SIZE);
	const requestedPage = Number.parseInt(pg ?? '1');
	const page = Number.isNaN(requestedPage)
		? 1
		: Math.min(Math.max(requestedPage, 1), totalPages || 1);
	const [congregations, denomination] = await Promise.all([
		db
			.prepare('SELECT * FROM Congregation WHERE presbyteryId = ? ORDER BY name LIMIT ? OFFSET ?')
			.bind(presbytery.id, PAGE_SIZE, (page - 1) * PAGE_SIZE)
			.all(),
		db.prepare('SELECT * FROM Denomination WHERE slug = ?').bind(params.denomination).first(),
	]);
	presbytery.congregations = congregations.results;
	presbytery.denomination = denomination;
	if (denomination) denomination.continental = asBoolean(denomination.continental);

	return { presbytery, page, totalPages, totalResults };
}
