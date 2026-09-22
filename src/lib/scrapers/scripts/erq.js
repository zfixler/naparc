import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import {
	batchUpsertCongregations,
	delayFetch,
	geocodeAddress,
	getAddressLabel,
} from '../utils/index.js';

const denominationSlug = 'erq';
const denominationNamespace = 'a7293df1-597a-40af-9a31-2a6da5f3367a';
const churchesUrl = 'https://erq.ca/fr/Eglises';

/**
 * Return the row containing an icon with the specified accessible label.
 *
 * @param {cheerio.CheerioAPI} $
 * @param {any} card
 * @param {string} label
 */
function findRow($, card, label) {
	return $(card).find(`img[alt="${label}"]`).first().parent();
}

/**
 * Parse the ERQ churches directory HTML.
 *
 * @param {string} html
 * @returns {Array<import('../utils/index.js').CongregationWithPresbytery>}
 */
export function getErqDenomination(html) {
	const $ = cheerio.load(html);
	/** @type {Array<import('../utils/index.js').CongregationWithPresbytery>} */
	const congregations = [];

	$('h3').each((_, heading) => {
		const card = $(heading).closest('.overflow-hidden');
		if (!card.length) return;

		const name = $(heading).text().trim();
		const addressLink = findRow($, card[0], 'adresse').find('a').first();
		const address = addressLink.text().trim();
		if (!name || !address) return;

		const website = findRow($, card[0], 'lien').find('a').first().attr('href')?.trim() || null;
		const phone = findRow($, card[0], 'telephone').find('p').first().text().trim() || null;
		const contactLine = findRow($, card[0], 'email').find('p').first().text().trim();
		const email = contactLine.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0] || null;
		const contact = contactLine.split(/\s+(?:-|–|—)\s+/)[0]?.trim() || null;
		const pastor =
			contact && /^(?:pastor|pasteur)\s+/i.test(contact)
				? contact.replace(/^(?:pastor|pasteur)\s+/i, '').trim()
				: null;

		congregations.push({
			id: uuidv5(website || `${name}:${address}`, denominationNamespace),
			name,
			lon: null,
			lat: null,
			denominationSlug,
			pastor,
			updatedAt: null,
			createdAt: null,
			contact,
			email,
			website,
			phone,
			address,
			addressLabel: getAddressLabel(address),
			mapUrl: addressLink.attr('href')?.trim() || null,
			presbyteryId: null,
		});
	});

	return congregations;
}

/**
 * Resolve coordinates from an ERQ Google Maps link.
 *
 * @param {string|null|undefined} mapUrl
 * @returns {Promise<{latitude: number, longitude: number}|null>}
 */
export async function getMapCoordinates(mapUrl) {
	if (!mapUrl) return null;

	const response = await fetch(mapUrl, { redirect: 'manual' });
	const destination = response.headers.get('location') || response.url;
	const dataCoordinates = destination.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
	const viewportCoordinates = destination.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
	const coordinates = dataCoordinates || viewportCoordinates;

	return coordinates
		? { latitude: Number(coordinates[1]), longitude: Number(coordinates[2]) }
		: null;
}

async function buildErqDenomination() {
	const response = await fetch(churchesUrl);
	if (!response.ok) {
		throw new Error(`ERQ directory request failed with status ${response.status}`);
	}

	const denomination = getErqDenomination(await response.text());
	if (!denomination.length) {
		throw new Error('ERQ directory returned no congregations');
	}

	for (const congregation of denomination) {
		const location =
			(await getMapCoordinates(congregation.mapUrl).catch(() => null)) ||
			(await geocodeAddress([`${congregation.address}, Canada`], 'ca'));
		if (location) {
			congregation.lat = location.latitude;
			congregation.lon = location.longitude;
		} else {
			throw new Error(`Could not locate ERQ congregation: ${congregation.name}`);
		}
		await delayFetch();
	}

	await batchUpsertCongregations(denomination);
	return denomination.length;
}

export default buildErqDenomination;
