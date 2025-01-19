import { setTimeout as sleep } from 'node:timers/promises';
import { prisma } from '../../lib/prisma.js';

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
/**@typedef {import('@prisma/client').Congregation & { presbytery?: import('@prisma/client').Presbytery }} CongregationWithPresbytery */

/**
 * Batch upserts congregations into the database.
 *
 * @param {Array<CongregationWithPresbytery>} congregationsArray - Array of congregation objects to be upserted.
 * @param {number} [batchSize=100] - The size of each batch for processing.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 *
 * @typedef {Object} Congregation
 * @property {string} id - The unique identifier of the congregation.
 * @property {Object} presbytery - The presbytery object associated with the congregation.
 * @property {string} presbytery.id - The unique identifier of the presbytery.
 *
 * @typedef {Object} Presbytery
 * @property {string} id - The unique identifier of the presbytery.
 */
export async function batchUpsertCongregations(congregationsArray, batchSize = 100) {
	// Extract presbyteries from congregations
	const presbyteries = congregationsArray
		.map((c) => c.presbytery)
		.filter((p) => p && p.id && !p.id.includes('undefined'));

	// Create missing presbyteries
	if (presbyteries && presbyteries.length) {
		await prisma.presbytery.createMany({
			data: presbyteries.filter((p) => p !== undefined),
			skipDuplicates: true,
		});
	}

	// Transform data to match schema
	const congregations = congregationsArray
		.map(({ presbytery, ...rest }) => ({
			...rest,
			presbyteryId: presbytery?.id,
		}))
		.filter(
			(/** @type {{ id: string | string[]; }} */ c) =>
				c.id && typeof c.id === 'string' && !c.id.includes('undefined'),
		)
		.filter(
			(/** @type {{ id: any; }} */ c, /** @type {any} */ index, /** @type {any[]} */ self) =>
				c && self.findIndex((/** @type {{ id: any; }} */ t) => t.id === c.id) === index,
		);

	const batches = [];
	for (let i = 0; i < congregations.length; i += batchSize) {
		batches.push(congregations.slice(i, i + batchSize));
	}

	let successCount = 0;
	for (const batch of batches) {
		try {
			await prisma.$transaction(async (tx) => {
				// Find existing congregations
				const existingIds = (
					await tx.congregation.findMany({
						where: { id: { in: batch.map((/** @type {{ id: any; }} */ c) => c.id) } },
						select: { id: true },
					})
				).map((c) => c.id);

				// Split into creates and updates
				const toCreate = batch.filter(
					(/** @type {{ id: string; }} */ c) => !existingIds.includes(c.id),
				);
				const toUpdate = batch.filter((/** @type {{ id: string; }} */ c) =>
					existingIds.includes(c.id),
				);

				// Perform batch operations
				if (toCreate.length) {
					await tx.congregation.createMany({ data: toCreate });
				}

				for (const congregation of toUpdate) {
					await tx.congregation.update({
						where: { id: congregation.id },
						data: congregation,
					});
				}
			});

			successCount += batch.length;
			console.log(`Processed ${successCount} congregations`);
		} catch (error) {
			if (error instanceof Error && error.message) {
				console.error(`Failed to process batch: ${error.message}`);
				console.error('Failed batch data:', batch);
			}
		}
	}
}

/**
 * Delays the execution of a fetch request for a random amount of time between 2 and 4 seconds.
 *
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
export async function delayFetch() {
	// Delay before executing fetch for a random amount of time between 2 and 4 seconds
	await sleep(Math.random() * (4000 - 2000 + 1) + 2000);
	return;
}

/**
 * Geocodes an address by progressively removing parts of it and querying the Nominatim API.
 * It tries different variations of the address, starting with the full address and progressively
 * removing components to improve the chances of finding a valid geocoding result.
 *
 * @param {Array<string>} address - An array of address components (e.g., street, city, state, zip code).
 * @returns {Promise<{latitude: number, longitude: number} | null>} - Returns an object with latitude and longitude if successful, or null if all attempts fail.
 */
export async function geocodeAddress(address) {
	for (let i = 0; i < address.length + 1; i++) {
		if (i > 0) address.shift();
		const attempt = address.join(', ');
		const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(attempt)}&format=json&limit=1`;

		try {
			const response = await fetch(url, {
				headers: { 'User-Agent': `NAPARC Search (${process.env.MAIL_TO})` },
			});
			const data = await response.json();

			if (data.length > 0) {
				const { lat, lon } = data[0];
				console.log(`✅ Found: ${attempt}`);
				return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
			}
		} catch (error) {
			console.error(`Error fetching data for ${attempt}:`, error);
		}

		// Wait between retries
		await sleep(1000);
	}

	console.log(`❌ All attempts failed for: ${address}`);
	return null;
}
