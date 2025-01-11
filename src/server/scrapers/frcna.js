import { v5 as uuidv5 } from 'uuid';
import { batchUpsertCongregations } from '../utils/index.js';

async function buildFrcnaDenomination() {
	const response = await fetch('https://frcna.org/api/churches/');
	const { data } = await response.json();
	const denominationSlug = 'frcna';
	const denominationNamespace = 'da306577-2335-4c49-b28d-7a6f3d3c8bff';

	/**
	 * @typedef {Object} Church
	 * @property {string} address - The street address of the church.
	 * @property {string} city - The city where the church is located.
	 * @property {Object} image - The image object containing image data.
	 * @property {Object} image.data - The data object for the image.
	 * @property {Object} image.data.attributes - Attributes of the image.
	 * @property {string} image.data.attributes.alternativeText - Alternative text for the image.
	 * @property {string} image.data.attributes.url - URL path to the image.
	 * @property {string} institutionDate - The institution date in YYYY-MM-DD format.
	 * @property {number} latitude - The latitude coordinate of the church location.
	 * @property {number} longitude - The longitude coordinate of the church location.
	 * @property {string} minister - The name of the current minister.
	 * @property {string} name - The name of the church.
	 * @property {string} sermonAudioUrl - URL to the church's sermon audio page.
	 * @property {string} serviceTimes - The service times of the church.
	 * @property {string} state - The state or province where the church is located.
	 * @property {string} website - The official website URL of the church.
	 * @property {string} zip - The postal/ZIP code of the church's location.
	 */

	/** @type {import("../utils/index.js").CongregationWithPresbytery[]} */
	const denomination = data.map((/** @type {Church} **/ object) => {
		const altText = object.image?.data?.attributes?.alternativeText;
		return {
			id: uuidv5(object.institutionDate, denominationNamespace),
			lat: object.latitude,
			lon: object.longitude,
			pastor: object.minister,
			website: object.website,
			name: altText && !altText.toUpperCase().includes('JPG') ? altText : object.name,
			phone: null,
			email: null,
			address: `${object.address} ${object.city} ${object.state} ${object.zip}`,
			addressLabel: `${object.address} <br> ${object.city} ${object.state}, ${object.zip}`,
			contact: null,
			denominationSlug,
			presbyteryId: null,
			createdAt: null,
			updatedAt: null,
		};
	});

	await batchUpsertCongregations(denomination);

	return denomination.length;
}

export default buildFrcnaDenomination;
