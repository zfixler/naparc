import { getPrisma } from '$lib/prisma';

const prisma = getPrisma();

/**
 * Escape the five XML entities. Presbytery and denomination slugs are scraped,
 * so nothing that reaches a <loc> is assumed safe.
 * @param {string} value
 */
const escapeXml = (value) =>
	String(value).replace(
		/[&<>"']/g,
		(char) =>
			({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char] ?? char,
	);

/**
 * @param {string} loc
 * @param {Date|null} [lastmod]
 */
const urlEntry = (loc, lastmod) =>
	`\t<url>\n\t\t<loc>${escapeXml(loc)}</loc>` +
	(lastmod ? `\n\t\t<lastmod>${lastmod.toISOString().split('T')[0]}</lastmod>` : '') +
	`\n\t</url>`;

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, setHeaders }) {
	const { origin } = url;

	const denominations = await prisma.denomination.findMany({
		select: {
			slug: true,
			presbyteries: { select: { slug: true } },
			scrapeLogs: { select: { completedAt: true } },
			_count: { select: { congregations: true } },
		},
	});

	/** @type {string[]} */
	const entries = [
		urlEntry(`${origin}/`),
		urlEntry(`${origin}/denominations`),
		urlEntry(`${origin}/contact`),
	];

	for (const denomination of denominations) {
		// A denomination with nothing scraped yet renders an empty page; keep it out
		// of the sitemap rather than pointing crawlers at a dead end.
		if (denomination._count.congregations === 0) continue;

		const lastmod = denomination.scrapeLogs[0]?.completedAt ?? null;

		entries.push(urlEntry(`${origin}/${denomination.slug}/congregations`, lastmod));

		for (const presbytery of denomination.presbyteries) {
			entries.push(urlEntry(`${origin}/${denomination.slug}/${presbytery.slug}`, lastmod));
		}
	}

	setHeaders({
		'content-type': 'application/xml',
		// The underlying data only changes when the scrapers run, once a day.
		'cache-control': 'public, max-age=0, s-maxage=3600',
	});

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
			`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
			entries.join('\n') +
			`\n</urlset>\n`,
	);
}
