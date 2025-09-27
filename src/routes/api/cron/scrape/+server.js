import { scrapeManager } from '$lib/manager';
import { prisma } from '$lib/prisma';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		console.log('Starting daily scraping job...');

		// Get all denominations
		const denominations = await prisma.denomination.findMany({
			select: { slug: true, name: true },
		});

		const results = [];

		// Process each denomination sequentially to avoid overwhelming the database
		for (const { slug, name } of denominations) {
			try {
				console.log(`Checking scrape status for ${name} (${slug})...`);
				const result = await scrapeManager.checkAndScrape(slug);

				if (result) {
					results.push({ slug, name, status: 'scraped', count: result.count });
					console.log(`Successfully scraped ${name}: ${result.count} items`);
				} else {
					results.push({ slug, name, status: 'skipped', reason: 'not needed' });
					console.log(`Skipped ${name}: scraping not needed`);
				}

				// Small delay between denominations to be gentle on the database
				await new Promise((resolve) => setTimeout(resolve, 2000));
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : 'Unknown error';
				results.push({ slug, name, status: 'error', error: errorMessage });
				console.error(`Failed to scrape ${name}:`, errorMessage);
			}
		}

		console.log('Daily scraping job completed');
		return json({
			success: true,
			message: 'Daily scraping completed',
			results,
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
