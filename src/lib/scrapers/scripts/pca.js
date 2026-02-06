import puppeteer from 'puppeteer';
import { v5 as uuidv5 } from 'uuid';
import { batchUpsertCongregations, slugify } from '../utils/index.js';

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
export function extractDirectoryJson(string) {
	const startIndex = string.indexOf('per = ') + 6;
	const endIndex = string.indexOf('};', startIndex) + 1;
	if (startIndex !== -1 && endIndex !== -1) {
		return JSON.parse(string.substring(startIndex, endIndex));
	}
}

/**
 * Extracts church data from the provided JSON object.
 * @param {SourceJSON} json
 */
export function extractChurchData(json) {
	const denominationNamespace = 'cc90b134-4d0d-4769-95f2-cd63a821baf7';
	const denominationSlug = 'pca';

	return json.mapRS.map((value, index) => {
		const phone = json.dataRS[index][7];
		const pastor = json.dataRS[index][10];
		const presbytery = json.dataRS[index][11];
		const presbyteryUuid = uuidv5(presbytery, denominationNamespace);
		const idSeed = `${value.ln}_${value.lt}_${value.t}`;
		const id = uuidv5(idSeed, presbyteryUuid);

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
		};
	});
}

async function buildPcaDenomination() {
	console.log('Launching headless browser for PCA scraper...');
	const browser = await puppeteer.launch({
		headless: true,
		args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
	});

	try {
		const page = await browser.newPage();

		// Set a realistic viewport and user agent
		await page.setViewport({ width: 1920, height: 1080 });
		await page.setUserAgent(
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
		);

		console.log('Navigating to BatchGeo map...');
		await page.goto(
			'https://static.batchgeo.com/map/json/fed353c376144b1fed2f5e29150c2531/1709202319?_=1709342272827',
			{ waitUntil: 'networkidle0', timeout: 60000 },
		);

		console.log('Extracting church data from page...');
		// Extract the data from the page by evaluating JavaScript in the browser context
		const json = await page.evaluate(() => {
			// The BatchGeo data is typically stored in a variable like 'per' or similar
			// We need to find and return this data
			const scriptText = document.body.innerText || document.body.textContent || '';

			// Try to extract the JSON data using the same pattern as extractDirectoryJson
			const startIndex = scriptText.indexOf('per = ') + 6;
			const endIndex = scriptText.indexOf('};', startIndex) + 1;

			if (startIndex !== -1 && endIndex !== -1) {
				const jsonString = scriptText.substring(startIndex, endIndex);
				return JSON.parse(jsonString);
			}

			return null;
		});

		await browser.close();

		if (!json) {
			console.log('JSON Extraction failed.');
			return;
		}

		console.log(`Extracted data for ${json.mapRS?.length || 0} churches`);
		const denomination = extractChurchData(json);

		await batchUpsertCongregations([...denomination]);

		return denomination.length;
	} catch (error) {
		await browser.close();
		console.error('Error scraping PCA data:', error);
		throw error;
	}
}

export default buildPcaDenomination;
