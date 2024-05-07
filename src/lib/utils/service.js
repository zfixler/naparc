import { prisma } from "$lib/prisma";

/**
 * Extracts the pastor's name from the provided text.
 * @param {string|null} text - The input text to extract the pastor's name from.
 * @returns {string|undefined} The pastor's name or undefined if not found.
 */
export function getPastorName(text) {
	if (!text) return;
	const regex = /Pastor:\s*([A-Z][a-zA-Z. ]+)/;
	const match = text.match(regex);
	if (match) {
		return match[1];
	}
}

/**
 * Extracts the contact name from the provided text.
 * @param {string|null} text - The input text to extract the contact name from.
 * @returns {string|undefined} The contact name or undefined if not found.
 */
export function getContactName(text) {
	if (!text) return;
	const regex = /Contact:\s*([A-Z][a-zA-Z. ]+)/;
	const match = text.match(regex);
	if (match) {
		return match[1];
	}
}

/**
 * Extracts the contact email address from the provided text.
 * @param {string|null} text - The input text to extract the contact email address from.
 * @returns {string|undefined} The contact email address or undefined if not found.
 */
export function getContactEmailAddress(text) {
	if (!text) return;
	const emailRegex =
		/(?:mailto:)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
	const matches = text.match(emailRegex);
	if (matches) {
		return matches[1];
	}
}

/**
 * Extracts the contact phone number from the provided text.
 * @param {string|null} text - The input text to extract the contact phone number from.
 * @returns {string|undefined} The contact phone number or undefined if not found.
 */
export function getContactPhoneNumber(text) {
	if (!text) return;
	const phoneRegex = /\b(\d{3}-\d{3}-\d{4})\b/;
	const matches = text.match(phoneRegex);
	if (matches) {
		return matches[1];
	}
}

/**
 * Extracts the website URL from the provided text.
 * @param {string|null} text - The input text to extract the website URL from.
 * @returns {string|undefined} The website URL or undefined if not found.
 */
export function getWebsiteUrl(text) {
	if (!text) return;
	const websiteRegex = /Website:\s*<a\s.*?href="([^"]+)"/;
	const matches = text.match(websiteRegex);
	if (matches) {
		return matches[1];
	}
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

/** @typedef {import("@prisma/client").Presbytery} Presbytery */

/** @typedef {import("@prisma/client").Congregation & {presbytery: Presbytery}} Congregation */

/**
 * Create or update congregation in the database.
 * @param {Congregation} congregation
 */
export async function upsertCongregation(congregation) {
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
		},
	});
}
