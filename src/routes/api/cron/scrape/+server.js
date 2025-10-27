import { getPrisma } from '$lib/prisma';
import {
	buildArpDenomination,
	buildCanrcDenomionation,
	buildFrcnaDenomination,
	buildHrcDenomination,
	buildOpcDenomination,
	buildPcaDenomination,
	buildPrcDenomination,
	buildRcusDenomination,
	buildRpcnaDenomination,
	buildUrcnaDenomination,
} from '$lib/scrapers/scripts/index.js';
import { json } from '@sveltejs/kit';
const prisma = getPrisma();

/** @type {Record<string, () => Promise<number|undefined>>} */
const supportedDenominations = {
	arpc: buildArpDenomination,
	canrc: buildCanrcDenomionation,
	frcna: buildFrcnaDenomination,
	hrc: buildHrcDenomination,
	opc: buildOpcDenomination,
	pca: buildPcaDenomination,
	prc: buildPrcDenomination,
	rcus: buildRcusDenomination,
	rpcna: buildRpcnaDenomination,
	urcna: buildUrcnaDenomination,
};

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		console.log('Starting daily scraping job...');

		// Get all denominations
		const allDenominations = await prisma.scrapeLog.findMany({
			orderBy: {
				completedAt: 'asc',
			},
			select: {
				denominationSlug: true,
				attemptedAt: true,
			},
		});

		const denominationsToScrape = allDenominations.filter(
			({ denominationSlug, attemptedAt }) =>
				denominationSlug in supportedDenominations &&
				attemptedAt &&
				Date.now() - new Date(attemptedAt).getTime() > 48 * 60 * 60 * 1000,
		);

		if (denominationsToScrape.length === 0) {
			console.log('No denominations need scraping at this time.');
			return json({
				message: 'No denominations need scraping at this time',
				timestamp: new Date().toISOString(),
			});
		}

		// Process only half the denominations to avoid timeouts
		const halfLength = Math.ceil(denominationsToScrape.length / 2);
		const denominationsToProcess = denominationsToScrape.slice(0, halfLength);

		console.log(
			`Scraping ${denominationsToProcess.length} of ${denominationsToScrape.length} denominations: ${denominationsToProcess.map((d) => d.denominationSlug).join(', ')}`,
		);

		// Run all scrapers in parallel
		const scrapePromises = denominationsToProcess.map(async ({ denominationSlug }) => {
			try {
				console.log(`Starting scrape for ${denominationSlug}`);
				const count = await supportedDenominations[denominationSlug]();
				await prisma.scrapeLog.update({
					where: { denominationSlug },
					data: {
						completedAt: new Date(),
						attemptedAt: new Date(),
						count: count,
						message: 'success',
					},
				});
				console.log(`Completed scrape for ${denominationSlug}: ${count} congregations`);
			} catch (error) {
				console.error(`Failed scrape for ${denominationSlug}:`, error);
				await prisma.scrapeLog.update({
					where: { denominationSlug },
					data: {
						attemptedAt: new Date(),
						message: String(error),
					},
				});
			}
		});

		await Promise.all(scrapePromises);

		return json({
			message: 'Daily scraping completed',
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Cron job failed:', error);
		return json(
			{
				error: 'Internal server error',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 },
		);
	}
}
