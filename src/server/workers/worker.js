import { parentPort, workerData } from 'worker_threads';
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

/**
 * An object containing functions to build different denominations.
 * Each key represents a denomination code and the value is a function
 * that builds the corresponding denomination.
 *
 * @type {Object.<string, function>}
 * @property {function} arp - Function to build ARPC denomination.
 * @property {function} hrc - Function to build HRC denomination.
 * @property {function} opc - Function to build OPC denomination.
 * @property {function} pca - Function to build PCA denomination.
 * @property {function} rcus - Function to build RCUS denomination.
 * @property {function} rpcna - Function to build RPCNA denomination.
 * @property {function} urcna - Function to build URCNA denomination.
 */
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

/**
 * Asynchronously runs the worker process.
 * Extracts the denominationSlug from workerData and checks if it exists in the denominations object.
 * If the denominationSlug is invalid, sends an error message to the parent port and exits the process.
 *
 * @returns {Promise<void>} A promise that resolves when the function completes.
 */
async function run() {
	const { denominationSlug } = workerData;
	if (!parentPort) return;
	if (!denominations[denominationSlug]) {
		parentPort.postMessage({ success: false, error: 'Invalid denomination slug' });
		process.exit(0);
	}

	try {
		const count = await denominations[denominationSlug]().catch(
			(/** @type {{ message: any; }} */ error) => {
				parentPort && parentPort.postMessage({ success: false, error: error.message });
			},
		);
		parentPort.postMessage({ success: true, count });
	} catch (/** @type {any} */ error) {
		parentPort.postMessage({ success: false, error: error.message });
	} finally {
		process.exit(0);
	}
}

run();
