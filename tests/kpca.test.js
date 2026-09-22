import { describe, expect, it } from 'vitest';
import { extractKpcaMarkers, getKpcaDenomination } from '../src/lib/scrapers/scripts/kpca.js';

const layer = [
	null,
	'kosin-layer',
	'재미고신 소속 교회/선교사/군목/기관',
	'',
	[
		[
			null,
			null,
			null,
			null,
			null,
			[['그리니치 한인교회'], ['테스트 선교사']],
			[
				[
					[],
					null,
					1,
					1,
					[[null, [41.0, -73.6]], '0', null, 'kosin-layer', [41.0, -73.6], [0, -128], 'church-1'],
					[['그리니치 한인교회']],
				],
				[
					[],
					null,
					1,
					1,
					[
						[null, [40.0, -74.0]],
						'0',
						null,
						'kosin-layer',
						[40.0, -74.0],
						[0, -128],
						'missionary-1',
					],
					[['테스트 선교사']],
				],
			],
		],
	],
];
const pageData = [[1], ['mf.map', 'map-id', 'KPCA', null, [], [], [layer]]];
const embedHtml = `<script>var _pageData = ${JSON.stringify(JSON.stringify(pageData))};</script>`;
const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2"><Document>
	<Folder><name>재미고신 소속 교회/선교사/군목/기관</name>
		<Placemark><name>그리니치 한인교회</name><address>38 West End Ave., Old Greenwich, CT 06870</address>
			<ExtendedData>
				<Data name="구분"><value>교회</value></Data>
				<Data name="교회명(영어)"><value>Greenwich Korean Church</value></Data>
				<Data name="노회"><value>동부</value></Data>
				<Data name="담임목사"><value>박정원 목사</value></Data>
				<Data name="주소"><value>38 West End Ave., Old Greenwich, CT 06870</value></Data>
				<Data name="전화번호"><value>917-903-0281</value></Data>
				<Data name="이메일"><value>pastor@example.org</value></Data>
				<Data name="홈페이지"><value>example.org</value></Data>
			</ExtendedData>
		</Placemark>
		<Placemark><name>테스트 선교사</name><ExtendedData>
			<Data name="구분"><value>선교사</value></Data>
			<Data name="주소"><value>New York, NY</value></Data>
		</ExtendedData></Placemark>
	</Folder>
</Document></kml>`;

describe('extractKpcaMarkers', () => {
	it('extracts IDs and coordinates from the official map layer', () => {
		expect(extractKpcaMarkers(embedHtml)).toEqual([
			{ id: 'church-1', name: '그리니치 한인교회', lat: 41, lon: -73.6 },
			{ id: 'missionary-1', name: '테스트 선교사', lat: 40, lon: -74 },
		]);
	});
});

describe('getKpcaDenomination', () => {
	const denomination = getKpcaDenomination(kml, extractKpcaMarkers(embedHtml));

	it('keeps churches and excludes other map record types', () => {
		expect(denomination).toHaveLength(1);
	});

	it('normalizes church, contact, and presbytery fields', () => {
		expect(denomination[0]).toMatchObject({
			name: 'Greenwich Korean Church',
			pastor: '박정원',
			phone: '917-903-0281',
			email: 'pastor@example.org',
			website: 'https://example.org/',
			address: '38 West End Ave., Old Greenwich, CT 06870',
			lat: 41,
			lon: -73.6,
			denominationSlug: 'kpca',
			presbytery: {
				name: 'Eastern',
				slug: 'eastern',
				denominationSlug: 'kpca',
			},
		});
	});

	it('creates stable IDs', () => {
		expect(getKpcaDenomination(kml, extractKpcaMarkers(embedHtml))[0].id).toBe(denomination[0].id);
	});
});
