/** @type {import('@sveltejs/kit').Handle} */
export const handle = async ({ event, resolve }) => {
	const scheme = event.cookies.get('scheme');
	if (!scheme) return await resolve(event);

	return await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html.replace('data-scheme=""', `data-scheme="${scheme}"`);
		}
	});
};
