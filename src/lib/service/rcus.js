import { v5 as uuidv5 } from 'uuid';
import {
	upsertCongregation,
	slugify,
	getPastorName,
	getContactEmailAddress,
    getContactPhoneNumber,
    getAddressLabel,
} from '../utils/service.js';
import { prisma } from '$lib/prisma.js';

/**
 * Represents a location object with details about a place.
 * @typedef {Object} LocationObject
 * @property {string} map_id - The ID of the location on the map.
 * @property {string} address - The address of the location.
 * @property {string} description - Description of the location.
 * @property {string} pic - The picture of the location.
 * @property {string} link - The link associated with the location.
 * @property {Object} icon - The icon object representing the location.
 * @property {string} icon.url - The URL of the icon.
 * @property {boolean} icon.retina - Indicates if the icon is retina.
 * @property {string} lat - The latitude coordinate of the location.
 * @property {string} lng - The longitude coordinate of the location.
 * @property {string} anim - Animation related to the location.
 * @property {string} title - The title of the location.
 * @property {string} infoopen - Information openness.
 * @property {string} category - The category of the location.
 * @property {string} approved - Approval status.
 * @property {string} retina - Retina status.
 * @property {string} type - Type of the location.
 * @property {string} did - The DID of the location.
 * @property {string} sticky - Sticky status.
 * @property {string} other_data - Other additional data.
 * @property {string} layergroup - The layer group of the location.
 * @property {string} id - The ID of the location.
 * @property {string[]} categories - An array of categories associated with the location.
 * @property {any[]} custom_field_data - Custom field data.
 * @property {string} custom_fields_html - HTML representation of custom fields.
 */

async function buildRcusDenomination() {
	const response = await fetch(
		'https://rcus.org/wp-json/wpgmza/v1/features/base64eJyrVkrLzClJLVKyUqqOUcpNLIjPTIlRsopRMoxR0gEJFGeUFni6FAPFomOBAsmlxSX5uW6ZqTkpELFapVoABU0Wug',
		{
			headers: {
				accept: '*/*',
				'accept-language': 'en-US,en;q=0.9',
				priority: 'u=1, i',
				'sec-ch-ua':
					'"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
				'sec-ch-ua-mobile': '?0',
				'sec-ch-ua-platform': '"Windows"',
				'sec-fetch-dest': 'empty',
				'sec-fetch-mode': 'cors',
				'sec-fetch-site': 'same-origin',
				'x-requested-with': 'XMLHttpRequest',
				Referer: 'https://rcus.org/find-a-church/',
				'Referrer-Policy': 'strict-origin-when-cross-origin',
			},
			body: null,
			method: 'GET',
		}
	);

	/**
	 * @typedef {Object} DataObject
	 * @property {Array<LocationObject>} markers
	 */

	/**@type {DataObject} */
	const data = await response.json();
	const classis = [
		'Covenant East',
		'Northern Plains',
		'South Central',
		'Western',
	];

	const denominationSlug = 'rcus';
	const denominationNamespace = '3fdcc9c2-7704-456e-a563-7da83d0197bd';
    let count = 0;

	for await (const details of data.markers) {
		const presbyteryName = classis[parseInt(details.categories[0]) - 1];
		const presbyteryUuid = uuidv5(presbyteryName, denominationNamespace);
		const name = details.title;
		const id = uuidv5(slugify(name), presbyteryUuid);

		const congregation = {
			id,
			name,
			pastor: getPastorName(details.description, 'Rev\.'),
			email: getContactEmailAddress(details.description),
            phone: getContactPhoneNumber(details.description),
			website: details.link,
			lat: parseFloat(details.lat),
			lon: parseFloat(details.lng),
            address: details.address,
            addressLabel: getAddressLabel(details.address),
            contact: null,
            createdAt: null,
            updatedAt: null,
            presbyteryId: presbyteryUuid,
            presbytery: {
				denominationSlug,
				name: presbyteryName,
				id: presbyteryUuid,
				slug: slugify(presbyteryName),
			},
			denominationSlug,
		};

		await upsertCongregation(congregation).catch(err => console.log(err));
        count++;
	}

    return count;
}

export default buildRcusDenomination;
