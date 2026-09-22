import { queryD1 } from './d1-client.js';
import { countRegions } from '../src/lib/utils/regions.js';
import {
	buildArpDenomination,
	buildCanrcDenomionation,
	buildErqDenomination,
	buildFrcnaDenomination,
	buildHrcDenomination,
	buildKapcDenomination,
	buildKpcaDenomination,
	buildOpcDenomination,
	buildPcaDenomination,
	buildPrcDenomination,
	buildRcusDenomination,
	buildRpcnaDenomination,
	buildUrcnaDenomination,
} from '../src/lib/scrapers/scripts/index.js';

/** @type {Record<string, () => Promise<number|undefined>>} */
const supportedDenominations = {
	arpc: buildArpDenomination,
	canrc: buildCanrcDenomionation,
	erq: buildErqDenomination,
	frcna: buildFrcnaDenomination,
	hrc: buildHrcDenomination,
	kapc: buildKapcDenomination,
	kpca: buildKpcaDenomination,
	opc: buildOpcDenomination,
	pca: buildPcaDenomination,
	prc: buildPrcDenomination,
	rcus: buildRcusDenomination,
	rpcna: buildRpcnaDenomination,
	urcna: buildUrcnaDenomination,
};

async function refreshHomeStats() {
	const [statsResult, congregationsResult] = await Promise.all([
		queryD1(`SELECT COALESCE(SUM(count), 0) AS totalCongregations,
			COUNT(CASE WHEN count > 0 THEN 1 END) AS totalDenominations FROM ScrapeLog`),
		queryD1('SELECT addressLabel FROM Congregation WHERE addressLabel IS NOT NULL'),
	]);
	const { totalStates, totalProvinces } = countRegions(congregationsResult.results);
	await queryD1(
		`INSERT INTO HomeStats
			(id, totalCongregations, totalDenominations, totalStates, totalProvinces, updatedAt)
		 VALUES (1, ?, ?, ?, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET
			totalCongregations = excluded.totalCongregations,
			totalDenominations = excluded.totalDenominations,
			totalStates = excluded.totalStates,
			totalProvinces = excluded.totalProvinces,
			updatedAt = excluded.updatedAt`,
		[
			Number(statsResult.results[0]?.totalCongregations ?? 0),
			Number(statsResult.results[0]?.totalDenominations ?? 0),
			totalStates,
			totalProvinces,
			new Date().toISOString(),
		],
	);
}

async function runAllScrapers() {
	console.log('Starting scraper job...');
	console.log(`Timestamp: ${new Date().toISOString()}`);

	// Get all denominations from scrape log
	const { results: allDenominations } = await queryD1(
		'SELECT denominationSlug, attemptedAt FROM ScrapeLog ORDER BY completedAt ASC',
	);

	// Filter to denominations that need scraping (haven't been scraped in 48 hours)
	const denominationsToScrape = allDenominations.filter(
		({ denominationSlug, attemptedAt }) =>
			denominationSlug in supportedDenominations &&
			(!attemptedAt || Date.now() - new Date(attemptedAt).getTime() > 48 * 60 * 60 * 1000),
	);

	if (denominationsToScrape.length === 0) {
		await refreshHomeStats();
		console.log('✓ Refreshed homepage statistics.');
		console.log('✓ No denominations need scraping at this time.');
		return;
	}

	console.log(
		`Found ${denominationsToScrape.length} denominations to scrape: ${denominationsToScrape.map((d) => d.denominationSlug).join(', ')}`,
	);

	let successCount = 0;
	let failureCount = 0;

	// Run scrapers sequentially to avoid overwhelming the database
	for (const { denominationSlug } of denominationsToScrape) {
		try {
			console.log(`\n📥 Starting scrape for ${denominationSlug}...`);
			const startTime = Date.now();

			await supportedDenominations[denominationSlug]();
			// Materialize the exact count once after ingestion. Request handlers can then
			// read a single ScrapeLog row instead of scanning Congregation on every visit.
			const countResult = await queryD1(
				'SELECT COUNT(*) AS count FROM Congregation WHERE denominationSlug = ?',
				[denominationSlug],
			);
			const count = Number(countResult.results[0]?.count ?? 0);

			const duration = ((Date.now() - startTime) / 1000).toFixed(2);

			const completedAt = new Date().toISOString();
			await queryD1(
				`UPDATE ScrapeLog SET completedAt = ?, attemptedAt = ?, count = ?, message = 'success'
				 WHERE denominationSlug = ?`,
				[completedAt, completedAt, count, denominationSlug],
			);

			console.log(`✓ Completed ${denominationSlug}: ${count} congregations (${duration}s)`);
			successCount++;
		} catch (error) {
			console.error(`✗ Failed scrape for ${denominationSlug}:`, error);

			await queryD1(
				'UPDATE ScrapeLog SET attemptedAt = ?, message = ? WHERE denominationSlug = ?',
				[
					new Date().toISOString(),
					error instanceof Error ? error.message : String(error),
					denominationSlug,
				],
			);

			failureCount++;
		}
	}

	console.log('\n=== Scraping Summary ===');
	console.log(`✓ Successful: ${successCount}`);
	console.log(`✗ Failed: ${failureCount}`);
	console.log(`Total: ${denominationsToScrape.length}`);
	console.log(`Completed at: ${new Date().toISOString()}`);
	await refreshHomeStats();
	console.log('✓ Refreshed homepage statistics.');

	// Exit with error code if any scrapers failed
	if (failureCount > 0) {
		process.exit(1);
	}
}

// Run the scrapers
runAllScrapers().catch((error) => {
	console.error('Fatal error running scrapers:', error);
	process.exit(1);
});
