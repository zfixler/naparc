/**
 * schema.org builders. Every field is optional in the database, so each one is
 * added only when it actually has a value — an empty or null property is worse
 * than an absent one, since validators flag it.
 */

/**
 * @typedef {Object} CongregationLike
 * @property {string|null} [name]
 * @property {string|null} [address]
 * @property {string|null} [phone]
 * @property {string|null} [email]
 * @property {string|null} [website]
 * @property {number|null} [lat]
 * @property {number|null} [lon]
 */

/**
 * @param {CongregationLike} congregation
 */
function church(congregation) {
	const { name, address, phone, email, website, lat, lon } = congregation;

	return {
		'@type': 'Church',
		name,
		...(address ? { address } : {}),
		...(phone ? { telephone: phone } : {}),
		...(email ? { email } : {}),
		...(website ? { url: website } : {}),
		...(typeof lat === 'number' && typeof lon === 'number'
			? { geo: { '@type': 'GeoCoordinates', 'latitude': lat, 'longitude': lon } }
			: {}),
	};
}

/**
 * An ItemList of congregations, for the denomination and presbytery listings.
 * @param {CongregationLike[]} congregations
 * @param {string} name
 */
export function congregationListSchema(congregations, name) {
	const items = congregations.filter((congregation) => Boolean(congregation.name));

	return {
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name,
		'numberOfItems': items.length,
		'itemListElement': items.map((congregation, index) => ({
			'@type': 'ListItem',
			'position': index + 1,
			'item': church(congregation),
		})),
	};
}

/**
 * @param {string} origin
 */
export function websiteSchema(origin) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'name': 'NAPARC Search',
		'url': `${origin}/`,
		'description':
			'Search congregations across the denominations of the North American Presbyterian and Reformed Council by city, address, or postal code.',
		'inLanguage': 'en-US',
	};
}
