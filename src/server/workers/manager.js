import { prisma } from '$lib/prisma';
import { Worker } from 'worker_threads';

export class Manager {
	constructor() {
		this.activeWorkers = new Set();
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

		const scrapeLog = await prisma.scrapeLog.findUnique({
			where: { denominationSlug },
			select: { completedAt: true, attemptedAt: true },
		});

		if (!scrapeLog) return;

		const { completedAt, attemptedAt } = scrapeLog;

		/**
		 * @param {number | Date | null} attemptedAt
		 * @param {number | Date | null} completedAt
		 * @param {number | Date} threeDaysAgo
		 * @param {number | Date} oneDayAgo
		 */
		function shouldStartScrape(attemptedAt, completedAt, threeDaysAgo, oneDayAgo) {
			const isNeverRun = !completedAt && !attemptedAt;
			const isOldCompletion = completedAt && completedAt < threeDaysAgo;
			const canRetryAfterFailure =
				attemptedAt && completedAt && completedAt < threeDaysAgo && attemptedAt < oneDayAgo;

			return isNeverRun || isOldCompletion || canRetryAfterFailure;
		}

		if (shouldStartScrape(attemptedAt, completedAt, threeDaysAgo, oneDayAgo)) {
			console.log(`Scraping ${denominationSlug}`);
			return this.startScrape(denominationSlug);
		}
	}

	/**
	 * @param {string} denominationSlug
	 */
	startScrape(denominationSlug) {
		const worker = new Worker('./src/server/workers/worker.js', {
			workerData: { denominationSlug },
		});

		this.activeWorkers.add(worker);
		this.activeScrapes.set(denominationSlug, worker);

		// Add timeout to prevent hanging workers
		const timeout = setTimeout(
			() => {
				this.cleanup(worker, denominationSlug);
			},
			5 * 60 * 1000 * 2,
		); // 10 minutes

		return new Promise((resolve, reject) => {
			worker.on('message', async (data) => {
				clearTimeout(timeout);
				if (data.success) {
					await prisma.scrapeLog.update({
						where: { denominationSlug },
						data: {
							completedAt: new Date(),
							attemptedAt: new Date(),
							count: data.count,
							message: 'success',
						},
					});
				} else {
					await prisma.scrapeLog.update({
						where: { denominationSlug },
						data: {
							message: data.error,
							attemptedAt: new Date(),
						},
					});
				}
				this.cleanup(worker, denominationSlug);
				resolve(data);
			});

			worker.on('error', async (error) => {
				clearTimeout(timeout);
				await prisma.scrapeLog.update({
					where: { denominationSlug },
					data: {
						message: error.message,
						attemptedAt: new Date(),
					},
				});
				this.cleanup(worker, denominationSlug);
				reject(error);
			});
		});
	}

	/**
	 * @param {Worker} worker
	 * @param {string} denominationId
	 */
	cleanup(worker, denominationId) {
		worker.terminate();
		this.activeWorkers.delete(worker);
		this.activeScrapes.delete(denominationId);
	}

	cleanupAll() {
		for (const worker of this.activeWorkers) {
			worker.terminate();
		}
		this.activeWorkers.clear();
		this.activeScrapes.clear();
	}
}
