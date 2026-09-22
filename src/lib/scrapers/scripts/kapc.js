import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import { batchUpsertCongregations, getAddressLabel } from '../utils/index.js';

const denominationSlug = 'kapc';
const denominationNamespace = 'd5323ffe-85cb-4601-83be-79b2d378fb1b';
const mapId = '1naxtj_jXAlweH-NlQQJTGMOQXGKsC--3';
const churchLayerName = '44KAPC교회.xlsx';
const minimumExpectedCongregations = 400;
const embedUrl = `https://www.google.com/maps/d/u/0/embed?mid=${mapId}`;
const kmlUrl = `https://www.google.com/maps/d/kml?mid=${mapId}&forcekml=1`;

/** @param {string} value */
function normalizeText(value) {
	return value.replace(/\s+/g, ' ').trim();
}

/** @param {string} value */
function normalizeAddress(value) {
	return normalizeText(value).replace(/\s+,/g, ',');
}

/**
 * Repair rows where a street address was shifted into the English church-name column.
 *
 * @param {string} koreanName
 * @param {string} englishName
 * @param {string} address
 */
export function normalizeKapcIdentity(koreanName, englishName, address) {
	const normalizedEnglishName = normalizeText(englishName);
	const normalizedAddress = normalizeAddress(address);
	const englishNameIsStreet =
		/^\d+\s*\S/i.test(normalizedEnglishName) &&
		/\b(?:rd|road|st|street|ave|avenue|blvd|drive|dr|lane|ln|way|court|ct)\.?$/i.test(
			normalizedEnglishName,
		);
	const englishNameIsMalformed = /^[^\p{L}\p{N}]/u.test(normalizedEnglishName);

	return {
		name:
			normalizedEnglishName && !englishNameIsStreet && !englishNameIsMalformed
				? normalizedEnglishName
				: koreanName,
		address: englishNameIsStreet
			? normalizeAddress(`${normalizedEnglishName}, ${normalizedAddress}`)
			: normalizedAddress,
	};
}

/** @param {string} value */
function contactFields(value) {
	const normalized = normalizeText(value);
	if (!normalized) return { email: null, website: null };
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(normalized)) {
		return { email: normalized, website: null };
	}

	const withProtocol = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
	try {
		return { email: null, website: new URL(withProtocol).href };
	} catch {
		return { email: null, website: null };
	}
}

/**
 * Extract KAPC church markers from Google My Maps' embedded page data.
 *
 * @param {string} html
 * @returns {Array<{id: string, name: string, lat: number, lon: number}>}
 */
export function extractKapcMarkers(html) {
	const pageDataLiteral = html.match(/var _pageData = ("(?:\\.|[^"\\])*");/)?.[1];
	if (!pageDataLiteral) return [];

	let pageData;
	try {
		pageData = JSON.parse(JSON.parse(pageDataLiteral));
	} catch {
		return [];
	}

	const mapData = pageData.find(
		(/** @type {any} */ value) => Array.isArray(value) && value[0] === 'mf.map',
	);
	const layer = mapData?.[6]?.find(
		(/** @type {any} */ candidate) => candidate?.[2] === churchLayerName,
	);
	if (!layer) return [];

	const markers = [];
	for (const group of layer[4] || []) {
		for (const marker of group?.[6] || []) {
			const metadata = marker?.[4];
			const coordinates = metadata?.[4];
			const name = normalizeText(marker?.[5]?.[0]?.[0] || '');
			const id = metadata?.[6];
			if (
				name &&
				id &&
				Array.isArray(coordinates) &&
				Number.isFinite(coordinates[0]) &&
				Number.isFinite(coordinates[1])
			) {
				markers.push({ id, name, lat: coordinates[0], lon: coordinates[1] });
			}
		}
	}

	return markers;
}

/**
 * Build KAPC congregation records from the KML details and map markers.
 *
 * @param {string} kml
 * @param {ReturnType<typeof extractKapcMarkers>} markers
 * @returns {Array<import('../utils/index.js').CongregationWithPresbytery>}
 */
export function getKapcDenomination(kml, markers) {
	const $ = cheerio.load(kml, { xmlMode: true });
	const markerQueues = new Map();
	for (const marker of markers) {
		const queue = markerQueues.get(marker.name) || [];
		queue.push(marker);
		markerQueues.set(marker.name, queue);
	}

	/** @type {Array<import('../utils/index.js').CongregationWithPresbytery>} */
	const congregations = [];
	const seenCongregations = new Set();
	const folder = $('Folder')
		.filter((_, element) => normalizeText($(element).children('name').text()) === churchLayerName)
		.first();

	folder.children('Placemark').each((_, placemark) => {
		const koreanName = normalizeText($(placemark).children('name').text());
		if (!koreanName) return;

		const fields = Object.fromEntries(
			$(placemark)
				.find('ExtendedData > Data')
				.toArray()
				.map((field) => [$(field).attr('name'), normalizeText($(field).find('value').text())]),
		);
		const marker = markerQueues.get(koreanName)?.shift();
		const sourceAddress = normalizeAddress(
			$(placemark).children('address').text() || fields['주소'] || '',
		);
		const englishName = normalizeText(fields.Church || '');
		const { name, address } = normalizeKapcIdentity(koreanName, englishName, sourceAddress);
		if (!marker || !address || /^,?\s*$/.test(address)) return;

		const congregationKey = `${name.toLowerCase()}\0${address.toLowerCase()}`;
		if (seenCongregations.has(congregationKey)) return;
		seenCongregations.add(congregationKey);

		const pastor = normalizeText(fields['담임목사'] || '').replace(/\s*목사$/, '') || null;
		const { email, website } = contactFields(fields.Website || '');

		congregations.push({
			id: uuidv5(marker.id, denominationNamespace),
			name,
			lon: marker.lon,
			lat: marker.lat,
			denominationSlug,
			pastor,
			updatedAt: null,
			createdAt: null,
			contact: null,
			email,
			website,
			phone: normalizeText(fields['전화'] || '') || null,
			address,
			addressLabel: getAddressLabel(address),
			presbyteryId: null,
		});
	});

	return congregations;
}

async function buildKapcDenomination() {
	const [embedResponse, kmlResponse] = await Promise.all([fetch(embedUrl), fetch(kmlUrl)]);
	if (!embedResponse.ok || !kmlResponse.ok) {
		throw new Error(
			`KAPC directory request failed with status ${embedResponse.status}/${kmlResponse.status}`,
		);
	}

	const markers = extractKapcMarkers(await embedResponse.text());
	const denomination = getKapcDenomination(await kmlResponse.text(), markers);
	if (markers.length < minimumExpectedCongregations || denomination.length < markers.length * 0.9) {
		throw new Error(
			`KAPC directory returned an incomplete snapshot (${denomination.length}/${markers.length})`,
		);
	}

	await batchUpsertCongregations(denomination);
	return denomination.length;
}

export default buildKapcDenomination;
