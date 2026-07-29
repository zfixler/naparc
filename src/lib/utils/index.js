/**
 * Congregations listed per page of search results. Shared by the paginator, the
 * "showing x–y of z" summary, and the map's pin-to-page links so they cannot drift.
 */
export const PAGE_SIZE = 20;

/**
 * Returns a randomly generated UUID in a specified number of chunks.
 * @param {(1|2|3|4|5)} chunkNum - The number of 8 character UUID chunks to return.
 * @returns {string} UUID
 */
export const getUuidChunk = (chunkNum = 5) => {
	return crypto.randomUUID().split('-').slice(0, chunkNum).join('-');
};

/**
 * Paginates an array of results based on the provided page number.
 * @param {string | null} pg - The current page number, which will be parsed as an integer. Defaults to 1 if not provided.
 * @param {Array<any>} [results] - The array of results to paginate. Defaults to an empty array if no results are provided.
 * @returns {{results: Array<any>;page: number;totalResults: number;totalPages: number}} An object containing the paginated results details.
 */
export function paginateResults(pg, results = []) {
	const pageSize = PAGE_SIZE;
	const totalResults = results.length;
	const totalPages = Math.ceil(totalResults / pageSize);

	// Clamp to a real page so a hand-edited or stale `pg` cannot render an empty list
	// that is indistinguishable from "no congregations matched".
	const requested = parseInt(pg ?? '1');
	const page = Number.isNaN(requested) ? 1 : Math.min(Math.max(requested, 1), totalPages || 1);
	const offest = (page - 1) * pageSize;

	return {
		results: results.slice(offest, offest + pageSize),
		page,
		totalResults,
		totalPages,
	};
}

/**
 * Calculates the range of results currently being viewed on the given page.
 *
 * @param {number} currentPage - The current page number.
 * @param {number} totalResults - The total number of results available.
 * @returns {{ startIndex: number, endIndex: number }} An object containing the start and end indices of the results being viewed.
 */
export function calculateViewedResults(currentPage = 1, totalResults = 1) {
	const resultsPerPage = PAGE_SIZE;
	const startIndex = (currentPage - 1) * resultsPerPage + 1;
	const endIndex = Math.min(currentPage * resultsPerPage, totalResults);
	return {
		startIndex,
		endIndex,
	};
}
