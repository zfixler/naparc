import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import { batchUpsertCongregations, getAddressLabel } from '../utils/index.js';

const denominationSlug = 'kpca';
const denominationNamespace = 'c527256f-7efb-48a7-a2d8-9b266f18dd56';
const mapId = '1d8PLzLCxJabDVYxxUiNh6frlDEMxHqA';
const churchLayerName = '재미고신 소속 교회/선교사/군목/기관';
const minimumExpectedCongregations = 115;
const embedUrl = `https://www.google.com/maps/d/u/0/embed?mid=${mapId}`;
const kmlUrl = `https://www.google.com/maps/d/kml?mid=${mapId}&forcekml=1`;

const presbyteryNames = {
	남미: { name: 'South America', slug: 'south-america' },
	동부: { name: 'Eastern', slug: 'eastern' },
	북서: { name: 'Northwest', slug: 'northwest' },
	서부: { name: 'Western', slug: 'western' },
	서중: { name: 'West Central', slug: 'west-central' },
	수도: { name: 'Capital', slug: 'capital' },
	중남부: { name: 'South Central', slug: 'south-central' },
	중부: { name: 'Central', slug: 'central' },
};

/** @param {string} value */
function normalizeText(value) {
	return value.replace(/\s+/g, ' ').trim();
}

/** @param {string} value */
function normalizeWebsite(value) {
	const normalized = normalizeText(value);
	if (!normalized) return null;
	const withProtocol = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
	try {
		return new URL(withProtocol).href;
	} catch {
		return null;
	}
}

/** @param {string} koreanName */
function makePresbytery(koreanName) {
	const translated = presbyteryNames[koreanName];
	if (!translated) return null;
	return {
		...translated,
		id: uuidv5(`presbytery:${translated.slug}`, denominationNamespace),
		denominationSlug,
	};
}

/**
 * Extract marker IDs and coordinates from the official Google My Maps payload.
 *
 * @param {string} html
 * @returns {Array<{id: string, name: string, lat: number, lon: number}>}
 */
export function extractKpcaMarkers(html) {
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
 * Build KPCA congregation records from the official KML and map markers.
 *
 * @param {string} kml
 * @param {ReturnType<typeof extractKpcaMarkers>} markers
 * @returns {Array<import('../utils/index.js').CongregationWithPresbytery>}
 */
export function getKpcaDenomination(kml, markers) {
	const $ = cheerio.load(kml, { xmlMode: true });
	const markerQueues = new Map();
	for (const marker of markers) {
		const queue = markerQueues.get(marker.name) || [];
		queue.push(marker);
		markerQueues.set(marker.name, queue);
	}

	/** @type {Array<import('../utils/index.js').CongregationWithPresbytery>} */
	const congregations = [];
	const folder = $('Folder')
		.filter((_, element) => normalizeText($(element).children('name').text()) === churchLayerName)
		.first();

	folder.children('Placemark').each((_, placemark) => {
		const fields = Object.fromEntries(
			$(placemark)
				.find('ExtendedData > Data')
				.toArray()
				.map((field) => [$(field).attr('name'), normalizeText($(field).find('value').text())]),
		);
		if (fields['구분'] !== '교회') return;

		const koreanName = normalizeText($(placemark).children('name').text());
		const marker = markerQueues.get(koreanName)?.shift();
		const address = normalizeText(fields['주소'] || $(placemark).children('address').text());
		const presbytery = makePresbytery(fields['노회']);
		if (!marker || !address || !presbytery) return;

		congregations.push({
			id: uuidv5(marker.id, denominationNamespace),
			name: fields['교회명(영어)'] || koreanName,
			lon: marker.lon,
			lat: marker.lat,
			denominationSlug,
			pastor: fields['담임목사']?.replace(/\s*목사$/, '') || null,
			updatedAt: null,
			createdAt: null,
			contact: null,
			email: fields['이메일'] || null,
			website: normalizeWebsite(fields['홈페이지'] || ''),
			phone: fields['전화번호'] || null,
			address,
			addressLabel: getAddressLabel(address),
			presbytery,
			presbyteryId: presbytery.id,
		});
	});

	return congregations;
}

async function buildKpcaDenomination() {
	const [embedResponse, kmlResponse] = await Promise.all([fetch(embedUrl), fetch(kmlUrl)]);
	if (!embedResponse.ok || !kmlResponse.ok) {
		throw new Error(
			`KPCA directory request failed with status ${embedResponse.status}/${kmlResponse.status}`,
		);
	}

	const kml = await kmlResponse.text();
	const markers = extractKpcaMarkers(await embedResponse.text());
	const denomination = getKpcaDenomination(kml, markers);
	const $ = cheerio.load(kml, { xmlMode: true });
	const churchCount = $('Placemark').filter((_, placemark) => {
		return normalizeText($(placemark).find('Data[name="구분"] value').text()) === '교회';
	}).length;

	if (churchCount < minimumExpectedCongregations || denomination.length < churchCount * 0.9) {
		throw new Error(
			`KPCA directory returned an incomplete snapshot (${denomination.length}/${churchCount})`,
		);
	}

	await batchUpsertCongregations(denomination);
	return denomination.length;
}

export default buildKpcaDenomination;
