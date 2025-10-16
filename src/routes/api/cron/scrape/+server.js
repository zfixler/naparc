import { prisma } from '$lib/prisma';
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

		const denominationToScrapeObj = allDenominations.filter(
			({ denominationSlug, attemptedAt }) =>
				denominationSlug in supportedDenominations &&
				attemptedAt &&
				Date.now() - new Date(attemptedAt).getTime() > 48 * 60 * 60 * 1000,
		)[0];
		const denominationToScrape = denominationToScrapeObj?.denominationSlug;

		try {
			const count = await supportedDenominations[denominationToScrape]();
			await prisma.scrapeLog.update({
				where: { denominationSlug: denominationToScrape },
				data: {
					completedAt: new Date(),
					attemptedAt: new Date(),
					count: count,
					message: 'success',
				},
			});
		} catch (error) {
			await prisma.scrapeLog.update({
				where: { denominationSlug: denominationToScrape },
				data: {
					attemptedAt: new Date(),
					message: String(error),
				},
			});
		}

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
