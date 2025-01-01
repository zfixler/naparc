import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import { batchUpsertCongregations, delayFetch } from '../utils/index.js';

/**
 * Fetches and parses congregation information from a given URL.
 *
 * @param {string} url - The URL of the congregation page to fetch.
 * @returns {Promise<import('@prisma/client').Congregation>} A promise that resolves to a Congregation object containing the parsed data.
 *
 */
async function fetchCongregation(url) {
	await delayFetch();

	const denominationNamespace = 'dfca3bfb-6bb8-43e9-8b02-5feab5cda12f';
	const denominationSlug = 'hrc';

	const response = await fetch(url);
	const html = await response.text();
	const $ = cheerio.load(html);

	const mapAddressArray = $('#maranatha-map-section-address p')
		.html()
		?.split('<br>')
		.map((line) => line.trim());

	const mapCanvas = $('#maranatha-map-section-canvas');
	const locationContent = $('#maranatha-location-content');

	/**@type {import('@prisma/client').Congregation} */
	const congregation = {
		lat: parseFloat(mapCanvas.attr('data-ctfw-map-lat') || ''),
		lon: parseFloat(mapCanvas.attr('data-ctfw-map-lng') || ''),
		name: null,
		id: uuidv5(url, denominationNamespace),
		pastor: null,
		website: null,
		phone: null,
		email: null,
		address: null,
		addressLabel: null,
		contact: null,
		denominationSlug,
		presbyteryId: null,
		createdAt: null,
		updatedAt: null,
	};

	// Extract congregation name and address
	if (mapAddressArray) {
		if (mapAddressArray[0].includes('Reformed')) {
			congregation.name = mapAddressArray[0].trim();
			congregation.addressLabel = mapAddressArray.slice(1).join('<br>');
			congregation.address = mapAddressArray.slice(1).join(' ');
		} else {
			congregation.name = $('#maranatha-main-title').text().trim();
			congregation.addressLabel = mapAddressArray.join('<br>');
			congregation.address = mapAddressArray.join(' ');
		}
	}

	// Extract Pastor's name
	const pastorName = locationContent
		.find('p:contains("PASTOR:")')
		.text()
		.replace('PASTOR:', '')
		.replace('Rev.', '')
		.trim();

	// Extract website (if available)
	const website = locationContent.find('p:contains("WEBSITE:")').attr('href')?.trim();

	// Extract phone number
	const phone = $('#maranatha-location-phone a').attr('href')?.replace('tel:', '').trim();

	// Extract email address
	const email = $('#maranatha-location-email a').text().trim();

	if (phone) congregation.phone = phone;
	if (email) congregation.email = email;
	if (pastorName) congregation.pastor = pastorName;
	if (website) congregation.website = website;

	return congregation;
}

async function fetchLocationUrls() {
	/**
	 * @type {(string | undefined)[]}
	 */
	const urls = [];
	const url = 'https://heritagereformed.com/locations/';

	const response = await fetch(url);
	const html = await response.text();

	const $ = cheerio.load(html);

	$('.maranatha-entry-short-title').each((i, el) => {
		const url = $(el).find('a').attr('href');
		urls.push(url);
	});

	return urls;
}

async function buildHrcDenomination() {
	const denomination = [];

	const locations = await fetchLocationUrls();

	for await (const location of locations) {
		if (location) {
			const congregation = await fetchCongregation(location);
			denomination.push(congregation);
		}
	}

	await batchUpsertCongregations(denomination);
}

export default buildHrcDenomination;
