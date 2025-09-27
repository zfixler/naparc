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
} from '../scrapers/index.js';

const denominations = {
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

export class Manager {
	constructor() {
		this.activeScrapes = new Map();
	}

	/**
	 * @param {string} denominationSlug
	 */
	async checkAndScrape(denominationSlug) {
		const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

		// Skip if already scraping this denomination
		if (this.activeScrapes.has(denominationSlug)) {
			console.log(`Scrape already in progress for ${denominationSlug}`);
			return;
		}

		// Add this denomination to active scrapes to prevent concurrent runs
		this.activeScrapes.set(denominationSlug, true);

		try {
			const scrapeLog = await prisma.scrapeLog.findUnique({
				where: { denominationSlug },
				select: { completedAt: true, attemptedAt: true },
			});

			if (!scrapeLog) {
				this.activeScrapes.delete(denominationSlug);
				return;
			}

			const { completedAt, attemptedAt } = scrapeLog;

			/**
			 * @param {Date | null} attemptedAt
			 * @param {Date | null} completedAt
			 * @param {Date} threeDaysAgo
			 * @param {Date} oneDayAgo
			 * @returns {boolean}
			 */
			function shouldStartScrape(attemptedAt, completedAt, threeDaysAgo, oneDayAgo) {
				const hasNeverBeenAttempted = !attemptedAt;
				if (hasNeverBeenAttempted) return true;

				const wasSuccessful = completedAt && completedAt >= attemptedAt;
				if (wasSuccessful) {
					const isOld = completedAt < threeDaysAgo;
					return isOld;
				}

				const hasFailed = !completedAt || completedAt < attemptedAt;
				if (hasFailed) {
					const isReadyForRetry = attemptedAt < oneDayAgo;
					return isReadyForRetry;
				}

				return false;
			}

			if (shouldStartScrape(attemptedAt, completedAt, threeDaysAgo, oneDayAgo)) {
				console.log(`Starting scrape for ${denominationSlug}`);
				return await this.startScrape(denominationSlug);
			} else {
				// Remove from active scrapes since we're not actually scraping
				this.activeScrapes.delete(denominationSlug);
			}
		} catch (error) {
			// Make sure to remove from active scrapes on error
			this.activeScrapes.delete(denominationSlug);
			throw error;
		}
	}

	/**
	 * @param {string} denominationSlug
	 */
	async startScrape(denominationSlug) {
		// Check if denomination scraper exists
		// @ts-ignore
		const scraper = denominations[denominationSlug];
		if (!scraper) {
			throw new Error('Invalid denomination slug');
		}

		// Mark as attempted immediately
		await prisma.scrapeLog.update({
			where: { denominationSlug },
			data: {
				attemptedAt: new Date(),
			},
		});

		try {
			// Run the scraper directly instead of using worker threads
			const count = await scraper();

			// Update with success
			await prisma.scrapeLog.update({
				where: { denominationSlug },
				data: {
					completedAt: new Date(),
					count: count,
					message: 'success',
				},
			});

			this.activeScrapes.delete(denominationSlug);
			return { success: true, count };
		} catch (error) {
			// Update with error
			await prisma.scrapeLog.update({
				where: { denominationSlug },
				data: {
					message: error instanceof Error ? error.message : 'Unknown error',
				},
			});

			this.activeScrapes.delete(denominationSlug);
			throw error;
		}
	}
}
