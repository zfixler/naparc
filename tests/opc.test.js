import fs from 'fs';
import { scrapeOpcPresbytery } from '../src/lib/scrapers/scripts/opc.js';
import output from './fixtures/opc.json';

// use fs to read the html file in the fixtures folder
import { describe, expect, it } from 'vitest';

import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../tests/fixtures/opc.html'), 'utf-8');
const hatboro = fs.readFileSync(
	path.resolve(__dirname, '../tests/fixtures/debug_opc_hatboro.html'),
	'utf-8',
);

describe('scrapeOpcPresbytery', () => {
	it('should scrape the correct data from the given HTML', () => {
		const result = scrapeOpcPresbytery(html);

		expect(result).toEqual(output);
	});

	it('should scrape Hatboro correctly', () => {
		const result = scrapeOpcPresbytery(hatboro);
		expect(result).to.deep.include({
			id: 'opc_213',
			lon: -75.109706,
			lat: 40.192407,
			name: 'Trinity',
			website: null,
			address: '151 W. County Line Rd. Hatboro PA',
			addressLabel: '151 W. County Line Rd.<br>Hatboro PA',
			pastor: 'Larry J. Westerveld',
			contact: 'Larry J. Westerveld',
			email: 'westerveld.1@opc.org',
			phone: '215-675-1811',
			presbyteryId: 'bcfab39c-1fc8-5439-9f2f-b1342ecba81e',
			presbytery: {
				id: 'bcfab39c-1fc8-5439-9f2f-b1342ecba81e',
				name: 'Philadelphia',
				denominationSlug: 'opc',
				slug: 'philadelphia',
			},
			denominationSlug: 'opc',
			createdAt: null,
			updatedAt: null,
		});

		expect(result).to.deep.include({
			id: 'opc_202',
			lon: -75.258699,
			lat: 40.677247,
			name: 'Trinity',
			website: null,
			address: '531 Milford St. Easton PA',
			addressLabel: '531 Milford St.<br>Easton PA',
			pastor: 'Lane G. Tipton',
			contact: 'Lane G. Tipton',
			email: 'tipton.1@opc.org',
			phone: '610-253-2272',
			presbyteryId: 'bcfab39c-1fc8-5439-9f2f-b1342ecba81e',
			presbytery: {
				id: 'bcfab39c-1fc8-5439-9f2f-b1342ecba81e',
				name: 'Philadelphia',
				denominationSlug: 'opc',
				slug: 'philadelphia',
			},
			denominationSlug: 'opc',
			createdAt: null,
			updatedAt: null,
		});
	});
});
