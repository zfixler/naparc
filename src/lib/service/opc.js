import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import {
	getPastorName,
	getContactEmailAddress,
	getContactName,
	getContactPhoneNumber,
	getWebsiteUrl,
	upsertCongregation,
	slugify,
} from '../utils/service.js';

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
	 * @param {string} presbyteryId
	 */
	async function makeRequest(presbyteryId) {
		try {
			const url = `https://opc.org/locator.html?search_go=Y&presbytery_id=${presbyteryId}`;
			const response = await fetch(url, {
				headers: {
					'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
					'accept-language': 'en-US,en;q=0.9',
					'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
					'sec-ch-ua-mobile': '?0',
					'sec-ch-ua-platform': '"Windows"',
					'sec-fetch-dest': 'document',
					'sec-fetch-mode': 'navigate',
					'sec-fetch-site': 'none',
					'sec-fetch-user': '?1',
					'upgrade-insecure-requests': '1',
				},
				referrerPolicy: 'strict-origin-when-cross-origin',
				body: null,
				method: 'GET',
			});

			return await response.text();
		} catch (error) {
			console.log(error);
		}
	}

	/**
	 * Fetch all congregations in a given presbytery
	 * @param {string} presbyteryId
	 * @returns {Promise<object[]>}
	 */
	async function fetchCongregations(presbyteryId) {
		const html = await makeRequest(presbyteryId);
		if (!(typeof html === 'string')) return [];

		const $ = cheerio.load(html);
		const denominationNamespace = '5a189503-cf5b-4edf-92be-bdb863e669a0';
		const presbyteryName = $('[selected="selected"]').text();
		const denominationSlug = 'opc';
		const presbyteryUuid = uuidv5(presbyteryName, denominationNamespace);

		const mapScript = $(`script:contains("AddPointQ")`).text();
		const regexPattern = /AddPointQ\((.*?)\);/g;
		const captures = mapScript.match(regexPattern);

		const congregations = captures?.map((capture) => {
			const detailsArray = capture.split("'");
			const lon = parseFloat(detailsArray[1]);
			const lat = parseFloat(detailsArray[3]);
			const detailsNode = cheerio.load(detailsArray[7]);
			const name = detailsNode('h5').text();
			const website = getWebsiteUrl(detailsArray[7]);
			const addressLabel = detailsNode('p:first').html();
			const address = addressLabel?.split('<br>').join(' ');
			const key = website ? website : name.toUpperCase();
			const table = $(`.churchCard:contains(${key})`).html();
			const pastor = getPastorName(table);
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
				presbytery: {
					id: presbyteryUuid,
					name: presbyteryName,
					denominationSlug,
					slug: slugify(presbyteryName),
				},
			};

			return congregation;
		});
		return congregations || [];
	}

	/**
	 * Variable for all congregations in denomination
	 * @type {Array<any>}
	 */
	let denomination = [];

	for await (const presbyteryId of presbyteryIds) {
		const presbytery = await fetchCongregations(presbyteryId).catch((err) =>
			console.log(err)
		);
		denomination = denomination.concat(presbytery);
	}

	for await (const congregation of denomination) {
		if (congregation && !congregation.id.includes('undefined')) {
			await upsertCongregation(congregation).catch((err) => console.error(err));
		}
	}

	return denomination.length;
}

export default buildOpcDenomination;
