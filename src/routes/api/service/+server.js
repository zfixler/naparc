import {
	buildOpcDenomination,
	buildPcaDenomination,
	buildRpcnaDenomination,
	buildUrcnaDenomination,
} from '$lib/service';
import { json } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET(req) {
	const opc = await buildOpcDenomination().catch((err) => console.log(err));
	const pca = await buildPcaDenomination().catch((err) => console.log(err));
	const rpcna = await buildRpcnaDenomination().catch((err) => console.log(err));
	const urcna = await buildUrcnaDenomination().catch((err) => console.log(err));

	const results = {
		opc,
		pca,
		rpcna,
		urcna,
	};

	return json(results);
}
