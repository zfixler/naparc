import { setTimeout as sleep } from 'node:timers/promises';
import { batchD1 } from '../../../../scripts/d1-client.js';

/**
 * Extracts the pastor's name from the provided text.
 * @param {string|null} text - The input text to extract the pastor's name from.
 * @param {string} title - Rev. or Pastor: or other leading title
 * @returns {string|null} The pastor's name or null if not found.
 */
export function getPastorName(text, title) {
	if (!text) return null;
	const regex = new RegExp(`${title}\\s*([A-Z][a-zA-Z.'’\\s]+)`, 'i');
	const match = text.match(regex);
	if (match && match[1]) {
		const afterTitle =
			typeof match.index === 'number'
				? text.slice(match.index + match[0].length - match[1].length)
				: match[1];
		const nameMatch = afterTitle.match(/^([A-Z][a-zA-Z.'’\s-]*[a-zA-Z.'’])\b/);
		if (nameMatch && nameMatch[1]) {
			return nameMatch[1].trim();
		}
		return match[1].trim();
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
	const normalized = text.replace(/\\"/g, '"');
	const websiteRegex = /Website:\s*(?:<br\s*\/?\s*>\s*)*<a[^>]*href="([^"]+)"/i;
	const matches = normalized.match(websiteRegex);
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
/** @typedef {Record<string, any> & { presbytery?: Record<string, any> }} CongregationWithPresbytery */

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
	console.log(congregationsArray.length, 'congregations to process');

	const denominationSlug = congregationsArray[0]?.denominationSlug;
	if (denominationSlug) {
		console.log(`Processing ${congregationsArray.length} congregations for ${denominationSlug}`);
	}

	if (!denominationSlug || congregationsArray.length === 0) {
		console.warn('No valid congregation snapshot; leaving existing data unchanged.');
		return;
	}

	const presbyteries = /** @type {Array<Record<string, any>>} */ (
		congregationsArray.map((c) => c.presbytery).filter((p) => p?.id && !p.id.includes('undefined'))
	);
	const uniquePresbyteries = presbyteries.filter(
		(p, index, self) => self.findIndex((candidate) => candidate.id === p.id) === index,
	);
	const mappedCongregations = congregationsArray.map(({ presbytery, ...rest }) => ({
		...rest,
		presbyteryId: presbytery?.id ?? null,
	}));
	const congregations = /** @type {Array<Record<string, any>>} */ (mappedCongregations)
		.filter((c) => c.id && typeof c.id === 'string' && !c.id.includes('undefined'))
		.filter((c, index, self) => self.findIndex((candidate) => candidate.id === c.id) === index);

	const now = new Date().toISOString();
	const congregationCounts = new Map();
	for (const congregation of congregations) {
		if (congregation.presbyteryId) {
			congregationCounts.set(
				congregation.presbyteryId,
				(congregationCounts.get(congregation.presbyteryId) ?? 0) + 1,
			);
		}
	}
	const statements = [
		{
			sql: 'UPDATE Presbytery SET congregationCount = 0 WHERE denominationSlug = ?',
			params: [denominationSlug],
		},
	];
	statements.push(
		...uniquePresbyteries.map((presbytery) => ({
			sql: `INSERT INTO Presbytery (id, name, slug, denominationSlug, congregationCount)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug,
			denominationSlug = excluded.denominationSlug,
			congregationCount = excluded.congregationCount`,
			params: [
				presbytery.id,
				presbytery.name,
				presbytery.slug,
				presbytery.denominationSlug,
				congregationCounts.get(presbytery.id) ?? 0,
			],
		})),
	);
	statements.push({
		sql: 'DELETE FROM Congregation WHERE denominationSlug = ?',
		params: [denominationSlug],
	});
	for (const congregation of congregations) {
		statements.push({
			sql: `INSERT INTO Congregation
				(id, pastor, name, website, phone, email, address, addressLabel, contact, lon, lat,
				 presbyteryId, denominationSlug, createdAt, updatedAt)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			params: [
				congregation.id,
				congregation.pastor ?? null,
				congregation.name ?? null,
				congregation.website ?? null,
				congregation.phone ?? null,
				congregation.email ?? null,
				congregation.address ?? null,
				congregation.addressLabel ?? null,
				congregation.contact ?? null,
				congregation.lon ?? null,
				congregation.lat ?? null,
				congregation.presbyteryId,
				congregation.denominationSlug,
				now,
				now,
			],
		});
	}

	await batchD1(statements);

	console.log(`Replaced ${denominationSlug}: ${congregations.length} total congregations`);
}

/**
 * Delays the execution of a fetch request for a random amount of time between 2 and 4 seconds.
 *
 * @returns {Promise<void>} A promise that resolves after the delay.
 */
export async function delayFetch() {
	// Delay before executing fetch for a random amount of time between 1 and 2 seconds
	await sleep(Math.random() * (2000 - 1000 + 1) + 1000);
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

/**
 * @param {string} url
 */
export async function fetchWithHeaders(url) {
	const response = await fetch(url, {
		headers: {
			'User-Agent':
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
			'accept':
				'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
			'accept-encoding': 'gzip, deflate, br',
			'accept-language': 'en-US,en;q=0.9',
			'cache-control': 'max-age=0',
			'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
			'sec-ch-ua-mobile': '?0',
			'sec-ch-ua-platform': '"Windows"',
			'sec-fetch-dest': 'document',
			'sec-fetch-mode': 'navigate',
			'sec-fetch-site': 'none',
			'sec-fetch-user': '?1',
			'upgrade-insecure-requests': '1',
		},
		referrerPolicy: 'strict-origin-when-cross-origin',
		body: null,
		method: 'GET',
	});

	return response;
}
