import {
	buildOpcDenomination,
	buildPcaDenomination,
	buildRcusDenomination,
	buildRpcnaDenomination,
	buildUrcnaDenomination,
} from '../scrapers/index.js';
import { parentPort, workerData } from 'worker_threads';

const denominations = {
	opc: buildOpcDenomination,
	pca: buildPcaDenomination,
	rpcna: buildRpcnaDenomination,
	urcna: buildUrcnaDenomination,
	rcus: buildRcusDenomination,
};

async function run() {
	const { denominationSlug } = workerData;
	if (!denominations[denominationSlug]) {
		parentPort.postMessage({ success: false, error: 'Invalid denomination slug' });
		process.exit(0);
	}

	try {
		const count = await denominations[denominationSlug]().catch((error) => {
			parentPort.postMessage({ success: false, error: error.message });
		});
		parentPort.postMessage({ success: true, count });
	} catch (error) {
		parentPort.postMessage({ success: false, error: error.message });
	} finally {
		process.exit(0);
	}
}

run();
