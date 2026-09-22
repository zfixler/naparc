import { describe, expect, it } from 'vitest';
import {
	extractKapcMarkers,
	getKapcDenomination,
	normalizeKapcIdentity,
} from '../src/lib/scrapers/scripts/kapc.js';

const churchLayer = [
	null,
	'church-layer',
	'44KAPC교회.xlsx',
	'',
	[
		[
			null,
			null,
			null,
			null,
			null,
			[['한길교회']],
			[
				[
					[],
					null,
					1,
					1,
					[[null, [38.9, -77.1]], '0', null, 'church-layer', [38.9, -77.1], [0, -128], 'marker-1'],
					[['한길교회']],
				],
				[
					[],
					null,
					1,
					1,
					[[null, [40.0, -75.2]], '0', null, 'church-layer', [40.0, -75.2], [0, -128], 'marker-2'],
					[['한길교회 ']],
				],
			],
		],
	],
];
const pageData = [[1], ['mf.map', 'map-id', 'KAPC', null, [], [], [churchLayer]]];
const embedHtml = `<script>var _pageData = ${JSON.stringify(JSON.stringify(pageData))};</script>`;
const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document>
	<Folder><name>44KAPC교회.xlsx</name>
		<Placemark><name>한길교회</name><address>1724 Chain Bridge Rd. ,  McLean VA 22101</address>
			<ExtendedData>
				<Data name="Church"><value>Hangil Korean Presby. Church</value></Data>
				<Data name="전화"><value>703-555-0100</value></Data>
				<Data name="Website"><value>hangil.example</value></Data>
				<Data name="주소"><value>1724 Chain Bridge Rd. , McLean VA 22101</value></Data>
				<Data name="담임목사"><value>강종구 목사</value></Data>
			</ExtendedData>
		</Placemark>
		<Placemark><name>한길교회</name><address>10 Test Rd., Philadelphia PA 19000</address>
			<ExtendedData>
				<Data name="Church"><value></value></Data>
				<Data name="전화"><value></value></Data>
				<Data name="Website"><value>contact@example.org</value></Data>
				<Data name="담임목사"><value>홍길동 목사</value></Data>
			</ExtendedData>
		</Placemark>
	</Folder>
	<Folder><name>총회 파송 선교사.xlsx</name><Placemark><name>Excluded person</name></Placemark></Folder>
</Document></kml>`;

describe('extractKapcMarkers', () => {
	it('extracts marker IDs and coordinates from the church layer', () => {
		expect(extractKapcMarkers(embedHtml)).toEqual([
			{ id: 'marker-1', name: '한길교회', lat: 38.9, lon: -77.1 },
			{ id: 'marker-2', name: '한길교회', lat: 40.0, lon: -75.2 },
		]);
	});
});

describe('getKapcDenomination', () => {
	const denomination = getKapcDenomination(kml, extractKapcMarkers(embedHtml));

	it('joins repeated church names to their markers in source order', () => {
		expect(denomination).toHaveLength(2);
		expect(denomination.map(({ lat, lon }) => ({ lat, lon }))).toEqual([
			{ lat: 38.9, lon: -77.1 },
			{ lat: 40.0, lon: -75.2 },
		]);
	});

	it('normalizes congregation fields and prefers the English name', () => {
		expect(denomination[0]).toMatchObject({
			name: 'Hangil Korean Presby. Church',
			pastor: '강종구',
			phone: '703-555-0100',
			website: 'https://hangil.example/',
			email: null,
			address: '1724 Chain Bridge Rd., McLean VA 22101',
			denominationSlug: 'kapc',
			presbyteryId: null,
		});
	});

	it('falls back to Korean names and separates email values from websites', () => {
		expect(denomination[1]).toMatchObject({
			name: '한길교회',
			pastor: '홍길동',
			website: null,
			email: 'contact@example.org',
		});
	});

	it('creates stable unique IDs from Google marker IDs', () => {
		const ids = denomination.map(({ id }) => id);
		expect(new Set(ids).size).toBe(ids.length);
		expect(getKapcDenomination(kml, extractKapcMarkers(embedHtml)).map(({ id }) => id)).toEqual(
			ids,
		);
	});
});

describe('normalizeKapcIdentity', () => {
	it('falls back to the Korean name for malformed English names', () => {
		expect(
			normalizeKapcIdentity('벨빌한인장로교회', '.K.P.C', '432 Bridge St East, Belleville ON'),
		).toEqual({
			name: '벨빌한인장로교회',
			address: '432 Bridge St East, Belleville ON',
		});
	});

	it('moves a shifted street value from the church name back into the address', () => {
		expect(
			normalizeKapcIdentity('아이다호한인장로교회', '930N Cloverdale Rd.', 'Boise, ID 83713'),
		).toEqual({
			name: '아이다호한인장로교회',
			address: '930N Cloverdale Rd., Boise, ID 83713',
		});
	});
});
