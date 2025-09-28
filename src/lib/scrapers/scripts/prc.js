import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import { batchUpsertCongregations, geocodeAddress } from '../utils/index.js';

const denominationSlug = 'prc';
const denominationNamespace = '3d29bfd3-d31d-4574-aa96-8e357bb4bcf6';

async function fetchPageUrls() {
	const baseUrl = 'https://www.presbyterianreformed.org/';
	const response = await fetch(baseUrl);
	const html = await response.text();
	const $ = cheerio.load(html);
	/**
	 * @type {string[]}
	 */
	const links = [];

	const navigationItem = $('nav > ul > li').get(1);
	$(navigationItem)
		.find('a')
		.each((i, el) => {
			const href = $(el).attr('href');
			if (href) links.push(href);
		});

	return links;
}

/**
 * @param {string} page
 */
async function scrapeCongregation(page) {
	const response = await fetch(page);
	const html = await response.text();
	const $ = cheerio.load(html);

	/** @type {import('@prisma/client').Congregation} */
	const congregation = {
		id: uuidv5(page, denominationNamespace),
		name: $('h3.font_3').text(),
		lon: null,
		lat: null,
		denominationSlug,
		pastor: '',
		updatedAt: null,
		createdAt: null,
		contact: null,
		email: null,
		website: page,
		phone: null,
		address: null,
		addressLabel: null,
		presbyteryId: null,
	};

	$('p.font_7').each((i, el) => {
		const text = $(el).text();
		if (text.length < 25 && text.includes('Pastor')) {
			congregation.pastor = text.replace('Pastor', '').trim();
		}
	});

	// Extract phone number - looking for the text content that matches a phone number pattern
	const phoneNumber = $('.font_9')
		.filter(
			(_, el) =>
				!!$(el)
					.text()
					.trim()
					.match(/^\(\d{3}\)\s\d{3}-\d{4}$/),
		)
		.first()
		.text()
		.trim();

	if (phoneNumber) congregation.phone = phoneNumber;

	// Extract address - find the div after the "Address" heading
	/**
	 * @type {string[]}
	 */
	const addressLines = [];
	$('.font_4')
		.filter((_, el) => $(el).text().includes('Address'))
		.parent()
		.next()
		.next()
		.find('.font_9')
		.each((_, el) => {
			addressLines.push($(el).text().trim());
		});

	/**
	 * Formats the given address array based on the provided joiner string
	 * @param {Array<string>} address
	 * @param {string} joiner
	 * @returns {string}
	 */
	function joinAddress(address, joiner) {
		return address.length > 1
			? address.join(joiner).replace(/,+/g, ',')
			: address[0].split('\n').join(joiner).replace(/,+/g, ',');
	}

	if (addressLines.length) {
		congregation.address = joinAddress(addressLines, ', ');
		congregation.addressLabel = joinAddress(addressLines, '<br>');

		const location = await geocodeAddress(joinAddress(addressLines, '<br>').split('<br>'));

		if (location) {
			congregation.lat = location.latitude;
			congregation.lon = location.longitude;
		}
	}

	// Extract email - find the anchor tag with an email href
	const email = $('.font_9 a[href^="mailto:"]').first().text().trim();
	if (email) congregation.email = email;

	return congregation;
}

async function buildPrcDenomination() {
	const denomination = [];
	const pages = await fetchPageUrls().catch((error) => console.error(error));

	if (pages && pages.length) {
		for await (const page of pages) {
			const congregation = await scrapeCongregation(page).catch((error) => console.error(error));
			if (congregation) denomination.push(congregation);
		}

		if (denomination.length) {
			await batchUpsertCongregations(denomination);
			return denomination.length;
		}
	}
}

export default buildPrcDenomination;
