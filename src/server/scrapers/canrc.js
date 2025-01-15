import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import { batchUpsertCongregations, slugify } from '../utils/index.js';

const denominationNamespace = '84815bf6-a436-4eda-a5d9-bbef35466cf6';
const denominationSlug = 'canrc';

/**
 * @typedef {Object} Meta
 * @property {string} name - The full name of the church.
 * @property {string} slug - A URL-friendly identifier for the church.
 * @property {string} worship_latitude - The latitude coordinate of the worship location.
 * @property {string} worship_longitude - The longitude coordinate of the worship location.
 */

/**
 * @param {string} baseUrl - Base url for denomination churches page
 * @param {Meta} meta - Metadata about each congregation
 */
async function fetchCongregation(baseUrl, meta) {
	const response = await fetch(`${baseUrl}/${meta.slug}`);
	const html = await response.text();
	const $ = cheerio.load(html);

	/** @type {import("../utils/index.js").CongregationWithPresbytery} */
	const congregation = {
		id: uuidv5(meta.slug, denominationNamespace),
		name: meta.name,
		lon: parseFloat(meta.worship_longitude),
		lat: parseFloat(meta.worship_latitude),
		denominationSlug,
		pastor: '',
		updatedAt: null,
		createdAt: null,
		contact: null,
		email: null,
		website: null,
		phone: null,
		address: null,
		addressLabel: null,
		presbytery: {
			denominationSlug,
			name: '',
			slug: '',
			id: '',
		},
		presbyteryId: null,
	};

	$('h2').each((i, el) => {
		if (el && $(el).html()?.includes('Minister')) {
			const sibling = $(el).next();
			if (sibling.length) {
				congregation.pastor = sibling
					.find('.mt-4.font-medium')
					.text()
					.replace(/(Dr\.\s|Rev\.\s)/g, '<br>')
					.replace(/^<br>/, '')
					.trim();
			}
		}
	});

	$('h3').each((i, el) => {
		if (el && $(el).html()?.includes('Email:')) {
			const sibling = $(el).next();
			if (sibling.length) {
				congregation.email = sibling.find('a').text().trim();
			}
		}

		if (el && $(el).html()?.includes('Website:')) {
			const sibling = $(el).next();
			if (sibling.length) {
				congregation.website = sibling.find('a').attr('href')?.trim() || null;
			}
		}

		if (el && $(el).html()?.includes('Classis:')) {
			const sibling = $(el).next();
			if (sibling.length) {
				const name = sibling.find('a').text().trim();
				const slug = slugify(name);
				const id = uuidv5(slug, denominationNamespace);
				congregation.presbytery = {
					name,
					slug,
					id,
					denominationSlug,
				};
				congregation.presbyteryId = id;
			}
		}

		if (el && $(el).html()?.includes('Worship Address:')) {
			const sibling = $(el).next();
			if (sibling.length) {
				const addressArray = sibling
					.children()
					.map((i, el) => $(el).text().trim())
					.get();

				congregation.address = addressArray.join(' ').trim();
				congregation.addressLabel = addressArray.join('<br>').trim();
			}
		}

		if (el && $(el).html()?.includes('Clerk:')) {
			const sibling = $(el).next();
			if (sibling.length) {
				congregation.contact = sibling.children().find('div').text().trim();
			}
		}
	});

	return congregation;
}

async function buildCanrcDenomionation() {
	const baseUrl = 'https://canrc.org/churches';
	const response = await fetch(baseUrl);
	const html = await response.text();
	const $ = cheerio.load(html);
	const script = $('body script')
		.text()
		?.match(/=\s*(\[[\s\S]*\])/);
	const array = script && JSON.parse(script[1]);
	const denomination = [];

	for await (const meta of array) {
		const congregation = await fetchCongregation(baseUrl, meta).catch((err) => console.error(err));
		if (congregation) denomination.push(congregation);
	}

	await batchUpsertCongregations(denomination);
	return denomination.length;
}

export default buildCanrcDenomionation;
