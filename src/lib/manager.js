import { Manager } from '../../server/workers/manager.js';

export const scrapeManager = new Manager();

process.on('SIGTERM', () => {
	scrapeManager.cleanupAll();
	process.exit(0);
});
