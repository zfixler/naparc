import { getDatabase, asBoolean } from '$lib/server/database';
import { PAGE_SIZE } from '$lib/utils';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, url, platform }) {
	const db = getDatabase(platform);
	const pg = url.searchParams.get('pg');

	/** @type {Record<string, any> | null} */
	const denomination = await db
		.prepare(
			`SELECT d.*, COALESCE(s.count, 0) AS congregationCount
			FROM Denomination d LEFT JOIN ScrapeLog s ON s.denominationSlug = d.slug
			WHERE d.slug = ?`,
		)
		.bind(params.denomination)
		.first();

	if (!denomination) {
		error(404, 'Not found');
	}
	denomination.continental = asBoolean(denomination.continental);

	const totalResults = Number(denomination.congregationCount);
	const totalPages = Math.ceil(totalResults / PAGE_SIZE);
	const requestedPage = Number.parseInt(pg ?? '1');
	const page = Number.isNaN(requestedPage)
		? 1
		: Math.min(Math.max(requestedPage, 1), totalPages || 1);
	const { results: congregations } = await db
		.prepare(
			`SELECT * FROM Congregation WHERE denominationSlug = ?
			ORDER BY name LIMIT ? OFFSET ?`,
		)
		.bind(params.denomination, PAGE_SIZE, (page - 1) * PAGE_SIZE)
		.all();

	return { congregations, denomination, page, totalPages, totalResults };
}
