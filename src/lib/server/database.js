/**
 * Return the D1 binding for a SvelteKit server request.
 * @param {App.Platform | undefined} platform
 * @returns {Cloudflare.Env['DB']}
 */
export function getDatabase(platform) {
	if (!platform?.env?.DB) {
		throw new Error('The D1 DB binding is unavailable. Run the app with Wrangler.');
	}

	return platform.env.DB;
}

/** @param {unknown} value */
export function asBoolean(value) {
	return value === 1 || value === true;
}

/** @param {unknown} value */
export function asDate(value) {
	return typeof value === 'string' || typeof value === 'number' ? new Date(value) : null;
}
