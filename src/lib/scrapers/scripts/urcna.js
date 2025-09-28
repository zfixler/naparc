import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import { batchUpsertCongregations, slugify } from '../utils/index.js';

/**
 * Parse address string from church object
 * @param {ChurchInfo} churchInfo
 * @param {boolean} isLabel
 * @returns
 */
function getAddressString(churchInfo, isLabel) {
	const { addr, city, state, zip, country } = churchInfo;
	if (isLabel) {
		return `${addr} <br/> ${city}, ${state} ${zip} <br/> ${country}`;
	} else {
		return `${addr}, ${city}, ${state} ${zip}, ${country}`;
	}
}

/**
 * Remove phone numbers from a given string.
 * @param {string} str - The input string from which to remove phone numbers.
 * @returns {string} The string with phone numbers removed.
 */
function removePhoneNumbers(str) {
	// Regular expression to match phone numbers
	const phoneRegex = /\(\d{3}\) ?\d{3}-?\d{4}/g;

	// Replace all phone numbers with an empty string
	return str.replace(phoneRegex, '');
}

/**
 * @typedef {Object} ChurchInfo
 * @property {string} id - The unique identifier for the church.
 * @property {string} church - The name of the church.
 * @property {string} classis - The classis of the church.
 * @property {string} addr - The address of the church.
 * @property {string} city - The city where the church is located.
 * @property {string} state - The state where the church is located.
 * @property {string} zip - The ZIP code of the church.
 * @property {string} addr2 - The second address of the church.
 * @property {string} city2 - The second city where the church is located.
 * @property {string} state2 - The second state where the church is located.
 * @property {string} zip2 - The second ZIP code of the church.
 * @property {string} country - The country where the church is located.
 * @property {string} phone - The phone number of the church.
 * @property {string} fax - The fax number of the church.
 * @property {string} email - The email address of the church.
 * @property {string} web - The website of the church.
 * @property {string} serv - The service times of the church.
 * @property {string} min1 - The first minister of the church.
 * @property {string} min2 - The second minister of the church.
 * @property {string} loc - The location description of the church.
 * @property {string} lat - The latitude coordinate of the church.
 * @property {string} lng - The longitude coordinate of the church.
 * @property {string} upd - The last update date of the church information.
 */

/** @typedef {import("@prisma/client").Presbytery} Presbytery */
/** @typedef {import("@prisma/client").Congregation & {presbytery: Presbytery}} Congregation */

/**
 * Extract the argument to loadDialog(...) safely.
 * Evaluates the JS snippet with a stub loadDialog.
 * WARNING: Only use on trusted HTML sources.
 *
 * @param {string} js - e.g. "loadDialog('id=...&min1=Rev Pete Van\\'t Hoff...')"
 * @returns {string|null}
 */
function extractDialogArgument(js) {
	let result = null;
	try {
		/**
		 * @param {any} s
		 */
		// eslint-disable-next-line no-unused-vars
		function loadDialog(s) {
			result = s;
		}
		eval(js);
	} catch (e) {
		console.error('❗ Failed to eval loadDialog call:', js, e);
		result = null;
	}
	return result;
}

/**
 * Build URCNA denomination data from HTML input.
 * @param {string} html - HTML with congregation data
 * @returns {Array<Congregation|null>}
 */
export function getDenomination(html) {
	const $ = cheerio.load(html);

	/** @type {Array<string>} */
	const tableData = [];

	// Collect all hrefs under #churches
	$('#churches')
		.find('a')
		.each((i, el) => {
			const element = $(el);
			const href = element.attr('href') || '';
			if (href) tableData.push(href);
		});

	const denominationSlug = 'urcna';
	const denominationNamespace = '88bd409f-0593-4177-85a1-e8e326cb3689';

	const denomination = tableData.map((uri) => {
		// Decode the URI
		const decoded = decodeURI(uri);

		// Strip "javascript:" prefix
		const js = decoded.replace(/^javascript:/, '').trim();

		// Extract argument to loadDialog(...)
		const queryString = extractDialogArgument(js);
		if (!queryString) {
			console.error('❗ Could not parse loadDialog argument:', decoded);
			return null;
		}

		// Initialize congregation object with known fields
		const congregation = {
			id: '',
			church: '',
			classis: '',
			addr: '',
			city: '',
			state: '',
			zip: '',
			addr2: '',
			city2: '',
			state2: '',
			zip2: '',
			country: '',
			phone: '',
			fax: '',
			email: '',
			web: '',
			serv: '',
			min1: '',
			min2: '',
			loc: '',
			lat: '',
			lng: '',
			upd: '',
		};

		// Parse the query string into key-value pairs
		const params = new URLSearchParams(queryString);

		for (const [key, value] of params.entries()) {
			if (key && Object.hasOwn(congregation, key)) {
				// @ts-ignore
				congregation[key] = decodeURIComponent(value);
			}
		}

		// Create deterministic IDs
		const presbyteryUuid = uuidv5(congregation.classis, denominationNamespace);
		const id = congregation.id ? uuidv5(congregation.id, presbyteryUuid) : '';

		// Return final record
		return {
			id,
			name: congregation.church,
			address: getAddressString(congregation, false),
			addressLabel: getAddressString(congregation, true),
			website: congregation.web.includes('https://')
				? congregation.web
				: `https://${congregation.web}`,
			phone: congregation.phone,
			email: congregation.email,
			pastor: removePhoneNumbers(congregation.min1).replace('Rev. ', ''),
			lat: parseFloat(congregation.lat),
			lon: parseFloat(congregation.lng),
			presbyteryId: presbyteryUuid,
			presbytery: {
				id: presbyteryUuid,
				name: congregation.classis,
				denominationSlug,
				slug: slugify(congregation.classis),
			},
			denominationSlug,
			contact: null,
			updatedAt: null,
			createdAt: null,
		};
	});

	// Filter out any parsing failures
	return denomination.filter(Boolean);
}

async function buildUrcnaDenomination() {
	const url =
		'https://www.urcna.org/sysfiles/member/family/urcna_report.cfm?memberid=1651&public=1';
	const response = await fetch(url);
	const data = await response.text();

	const denomination = getDenomination(data);

	await batchUpsertCongregations(denomination.filter((church) => church !== null));

	return denomination.length;
}

export default buildUrcnaDenomination;
