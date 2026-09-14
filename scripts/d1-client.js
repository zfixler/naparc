const requiredEnvironmentVariables = [
	'CLOUDFLARE_ACCOUNT_ID',
	'CLOUDFLARE_D1_DATABASE_ID',
	'CLOUDFLARE_API_TOKEN',
];

function getConfiguration() {
	const missing = requiredEnvironmentVariables.filter((name) => !process.env[name]);
	if (missing.length) {
		throw new Error(`Missing D1 environment variables: ${missing.join(', ')}`);
	}

	return {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
		databaseId: process.env.CLOUDFLARE_D1_DATABASE_ID,
		apiToken: process.env.CLOUDFLARE_API_TOKEN,
	};
}

/**
 * Execute parameterized SQL against the production D1 database.
 * @param {{sql: string, params?: unknown[]} | {batch: Array<{sql: string, params?: unknown[]}>}} body
 */
async function request(body) {
	const { accountId, databaseId, apiToken } = getConfiguration();
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
		{
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		},
	);
	/** @type {any} */
	const payload = await response.json();
	if (
		!response.ok ||
		!payload.success ||
		payload.result?.some((/** @type {any} */ result) => !result.success)
	) {
		const message =
			payload.errors?.map((/** @type {any} */ error) => error.message).join('; ') ||
			response.statusText;
		throw new Error(`D1 query failed: ${message}`);
	}
	return payload.result;
}

/** @param {string} sql @param {unknown[]} [params] */
export async function queryD1(sql, params = []) {
	const results = await request({ sql, params });
	return results[0];
}

/** @param {Array<{sql: string, params?: unknown[]}>} batch */
export function batchD1(batch) {
	return request({ batch });
}
