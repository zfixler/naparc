import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import {
	batchUpsertCongregations,
	delayFetch,
	fetchWithHeaders,
	getContactEmailAddress,
	getContactName,
	getContactPhoneNumber,
	getPastorName,
	getWebsiteUrl,
	slugify,
} from '../utils/index.js';

/** @typedef {import("@prisma/client").Presbytery} Presbytery */
/** @typedef {import("@prisma/client").Congregation & {presbytery: Presbytery}} Congregation */

/**
 * @param {string} presbyteryId
 */
async function makeRequest(presbyteryId) {
	await delayFetch();

	try {
		const url = `https://opc.org/locator.html?search_go=Y&presbytery_id=${presbyteryId}`;
		const response = await fetchWithHeaders(url);

		return await response.text();
	} catch (error) {
		console.log(error);
	}
}

/**
 * Extracts the church ID from the provided text.
 * @param {string|null} text - The input text to extract the church ID from.
 * @returns {string|undefined} The church ID or undefined if not found.
 */
function getChurchId(text) {
	if (!text) return;
	const churchIdRegex = /church_id=(\d+)/;
	const matches = text.match(churchIdRegex);
	if (matches) {
		return matches[1];
	}
}

/**
 * Parses the provided HTML to extract information about congregations within an OPC presbytery.
 *
 * @param {string} html - The HTML content of the OPC presbytery page.
 * @returns {Array<Congregation>} An array of congregation objects, each containing details such as
 *   id, name, location, contact information, and presbytery details.
 *
 * Notes:
 * - The function uses the `cheerio` library to parse and query the HTML.
 * - Congregation IDs are ensured to be unique by appending an "a" if duplicates are detected.
 * - Helper functions like `getWebsiteUrl`, `getPastorName`, `getContactName`, `getContactEmailAddress`,
 *   `getContactPhoneNumber`, `getChurchId`, and `slugify` are assumed to be defined elsewhere.
 */
export function scrapeOpcPresbytery(html) {
	/** @type {Array<string>} */
	const congregationIds = [];

	const $ = cheerio.load(html);
	const denominationNamespace = '5a189503-cf5b-4edf-92be-bdb863e669a0';
	const presbyteryName = $('[selected="selected"]').text();
	const denominationSlug = 'opc';
	const presbyteryUuid = uuidv5(presbyteryName, denominationNamespace);

	const mapScript = $('script:contains("AddPointQ")').text();
	const regexPattern = /AddPointQ\((.*?)\);/g;
	const captures = mapScript.match(regexPattern);

	const congregations = captures?.map((capture) => {
		const detailsArray = capture.split(/(?<!\\)'/);
		const lon = parseFloat(detailsArray[3]);
		const lat = parseFloat(detailsArray[1]);
		const detailsNode = cheerio.load(detailsArray[7]);
		const name = detailsNode('h5').text();
		const website = getWebsiteUrl(detailsArray[7]);
		const addressLabel = detailsNode('p:first').html();
		const address = addressLabel?.split('<br>').join(' ') || null;
		const key = website ? website : name.toUpperCase();
		const table = $(`.churchCard:contains(${key})`).html();
		const pastor = getPastorName(table, 'Pastor:');
		const contact = pastor ? pastor : getContactName(table);
		const email = getContactEmailAddress(table);
		const phone = getContactPhoneNumber(table);

		const congregation = {
			id: `opc_${getChurchId(table)}`,
			lon,
			lat,
			name,
			website,
			address,
			addressLabel,
			pastor,
			contact,
			email,
			phone,
			presbyteryId: presbyteryUuid,
			presbytery: {
				id: presbyteryUuid,
				name: presbyteryName,
				denominationSlug,
				slug: slugify(presbyteryName),
			},
			denominationSlug,
			createdAt: null,
			updatedAt: null,
		};

		if (congregationIds.includes(congregation.id)) {
			congregation.id = `${congregation.id}a`;
			congregationIds.push(congregation.id);
		} else {
			congregationIds.push(congregation.id);
		}

		return congregation;
	});

	return congregations && congregations.length ? congregations : [];
}

/**
 * Initiate scrape of OPC directory and upsert congregations inside the database.
 */
async function buildOpcDenomination() {
	const presbyteryIds = [
		'1',
		'2',
		'3',
		'4',
		'5',
		'6',
		'7',
		'8',
		'9',
		'10',
		'11',
		'12',
		'13',
		'14',
		'15',
		'16',
		'17',
		'18',
	];

	/**
	 * Fetch all congregations in a given presbytery
	 * @param {string} presbyteryId
	 * @returns {Promise<Array<Congregation>>}
	 */
	async function fetchCongregations(presbyteryId) {
		const html = await makeRequest(presbyteryId);
		if (!(typeof html === 'string')) return [];
		return scrapeOpcPresbytery(html);
	}

	/**
	 * Variable for all congregations in denomination
	 * @type {Array<Congregation>}
	 */
	let denomination = [];

	const presbyteryPromises = presbyteryIds.map(fetchCongregations);
	const presbyteries = await Promise.all(presbyteryPromises);
	denomination = presbyteries.flat().filter(Boolean);

	await batchUpsertCongregations([...denomination]);

	return denomination.length;
}

export default buildOpcDenomination;
