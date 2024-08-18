import { v5 as uuidv5 } from 'uuid';
import { upsertCongregation, slugify } from '../utils/service.js';

/**
 * @typedef {Object} LocationData
 * @property {string} a - The address.
 * @property {string} c - The city.
 * @property {string} s - The state.
 * @property {string} z - The ZIP code.
 * @property {string} ct - The country.
 * @property {string} t - The name or title.
 * @property {string} u - The website URL.
 * @property {string} e - The email address.
 * @property {number} lt - The latitude.
 * @property {number} ln - The longitude.
 * @property {string} addr - The concatenated address.
 */

/**
 * @typedef {string[]} ChurchData
 * @description Array representing church information.
 * @property {string} 0 - Church Name
 * @property {string} 1 - Address 1
 * @property {string} 2 - Address 2
 * @property {string} 3 - City
 * @property {string} 4 - State
 * @property {string} 5 - Zip
 * @property {string} 6 - Country
 * @property {string} 7 - Church Phone
 * @property {string} 8 - Church EMail
 * @property {string} 9 - Church Website
 * @property {string} 10 - Pastor
 * @property {string} 11 - Presbytery
 * @property {string} 12 - Type Org
 */

/**
 * @typedef {Object} SourceJSON
 * @property {Array<LocationData>} mapRS - Location array.
 * @property {Array<ChurchData>} dataRS - Details array.
 */

/**
 * Extracts and parses a JSON object from a given string.
 * @param {string} string - The input string containing the JSON data.
 * @returns {SourceJSON|undefined} The parsed JSON object, or undefined if extraction fails.
 */
function extractDirectoryJson(string) {
	const startIndex = string.indexOf('per = ') + 6;
	const endIndex = string.indexOf('};', startIndex) + 1;
	if (startIndex !== -1 && endIndex !== -1) {
		return JSON.parse(string.substring(startIndex, endIndex));
	}
}

async function buildPcaDenomination() {
	const response = await fetch(
		'https://static.batchgeo.com/map/json/fed353c376144b1fed2f5e29150c2531/1709202319?_=1709342272827'
	);
	const data = await response.text();
	const json = extractDirectoryJson(data);

	if (!json) {
		console.log('JSON Extraction failed.');
		return;
	}

	const denominationNamespace = 'cc90b134-4d0d-4769-95f2-cd63a821baf7';
	const denominationSlug = 'pca';

	const denomination = json.mapRS.map((value, index) => {
		const phone = json.dataRS[index][7];
		const pastor = json.dataRS[index][10];
		const presbytery = json.dataRS[index][11];
		const presbyteryUuid = uuidv5(presbytery, denominationNamespace);
		const id = uuidv5(value.t, presbyteryUuid);

		return {
			id,
			lon: value.ln,
			lat: value.lt,
			name: value.t,
			website: value.u.length ? `https://${value.u}` : null,
			address: value.addr,
			addressLabel: `${value.a}<br>${value.c}, ${value.s} ${value.z}<br>${value.ct}`.trim(),
			pastor: pastor.replace('Rev. ', ''),
			phone,
			email: value.e,
			contact: null,
			presbyteryId: presbyteryUuid,
			presbytery: {
				denominationSlug,
				name: presbytery,
				id: presbyteryUuid,
				slug: slugify(presbytery),
			},
			denominationSlug,
            updatedAt: null,
            createdAt: null,
			distance: null,
		};
	});

	for await (const congregation of denomination) {
		if (congregation.id) {
			await upsertCongregation(congregation).catch((err) => console.error(err));
		}
	}

	return denomination.length;
}

export default buildPcaDenomination;
