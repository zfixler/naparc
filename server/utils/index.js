import { prisma } from '../../src/lib/prisma.js';

/**
 * Extracts the pastor's name from the provided text.
 * @param {string|null} text - The input text to extract the pastor's name from.
 * @param {string} title - Rev. or Pastor: or other leading title
 * @returns {string|null} The pastor's name or undefined if not found.
 */
export function getPastorName(text, title) {
	if (!text) return null;
	const regex = new RegExp(`${title}\\s*([A-Z][a-zA-Z. ]+)`, 'g');
	const match = text.match(regex);
	if (match) {
		return match[0].replace(title, '').trim();
	}
	return null;
}

/**
 * Extracts the contact name from the provided text.
 * @param {string|null} text - The input text to extract the contact name from.
 * @returns {string|null} The contact name or undefined if not found.
 */
export function getContactName(text) {
	if (!text) return null;
	const regex = /Contact:\s*([A-Z][a-zA-Z. ]+)/;
	const match = text.match(regex);
	if (match) {
		return match[1];
	}
	return null;
}

/**
 * Extracts the contact email address from the provided text.
 * @param {string|null} text - The input text to extract the contact email address from.
 * @returns {string|null} The contact email address or undefined if not found.
 */
export function getContactEmailAddress(text) {
	if (!text) return null;
	const emailRegex = /(?:mailto:)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
	const matches = text.match(emailRegex);
	if (matches) {
		return matches[1];
	}
	return null;
}

/**
 * Extracts the contact phone number from the provided text.
 * @param {string|null} text - The input text to extract the contact phone number from.
 * @returns {string|null} The contact phone number or undefined if not found.
 */
export function getContactPhoneNumber(text) {
	if (!text) return null;
	const phoneRegex = /\b(\d{3}-\d{3}-\d{4})\b/;
	const matches = text.match(phoneRegex);
	if (matches) {
		return matches[1];
	}
	return null;
}

/**
 * Extracts the website URL from the provided text.
 * @param {string|null} text - The input text to extract the website URL from.
 * @returns {string|null} The website URL or undefined if not found.
 */
export function getWebsiteUrl(text) {
	if (!text) return null;
	const websiteRegex = /Website:\s*<a\s.*?href="([^"]+)"/;
	const matches = text.match(websiteRegex);
	if (matches) {
		return matches[1];
	}
	return null;
}

/**
 * Return a slugified version of a string.
 * @param {string} str
 * @returns {string}
 */
export function slugify(str) {
	return str
		.toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with dashes
		.replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters except dashes
		.replace(/-{2,}/g, '-') // Replace multiple dashes with single dash
		.replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

/**
 * Inserts a <br> tag into a given string after the first occurrence of a comma (,).
 * @param {string} addressString - The input string.
 * @returns {string|null} The modified string with <br> inserted after the first comma, or null if the input string is empty or undefined.
 */
export function getAddressLabel(addressString) {
	if (!addressString) return null;
	const index = addressString.indexOf(',');
	if (index !== -1) {
		return `${addressString.slice(0, index + 1)}<br>${addressString.slice(index + 1)}`;
	}
	return addressString;
}

/** @typedef {import("@prisma/client").Presbytery} Presbytery */

/** @typedef {import("@prisma/client").Congregation & {presbytery: Presbytery}} Congregation */

/**
 * Create or update congregation in the database.
 * @param {Congregation} congregation
 */
export async function upsertCongregation(congregation) {
	try {
		await prisma.congregation.upsert({
			where: {
				id: congregation.id,
			},
			update: {
				lon: congregation.lon,
				lat: congregation.lat,
				name: congregation.name,
				website: congregation.website,
				address: congregation.address,
				addressLabel: congregation.addressLabel,
				pastor: congregation.pastor,
				contact: congregation.contact,
				email: congregation.email,
				phone: congregation.phone,
				presbytery: {
					update: {
						slug: congregation.presbytery.slug,
						id: congregation.presbytery.id,
						name: congregation.presbytery.name,
						denominationSlug: congregation.presbytery.denominationSlug,
					},
				},
			},
			create: {
				id: congregation.id,
				lon: congregation.lon,
				lat: congregation.lat,
				name: congregation.name,
				website: congregation.website,
				address: congregation.address,
				addressLabel: congregation.addressLabel,
				pastor: congregation.pastor,
				contact: congregation.contact,
				email: congregation.email,
				phone: congregation.phone,
				presbytery: {
					connectOrCreate: {
						where: {
							id: congregation.presbytery.id,
						},
						create: {
							id: congregation.presbytery.id,
							slug: congregation.presbytery.slug,
							name: congregation.presbytery.name,
							denominationSlug: congregation.presbytery.denominationSlug,
						},
					},
				},
				denomination: {
					connect: {
						slug: congregation.denominationSlug,
					},
				},
			},
		});
	} catch (error) {
		console.log('Upsert error:', error);
	}
}