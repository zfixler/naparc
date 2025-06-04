import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { extractChurchData, extractDirectoryJson } from '../src/server/scrapers/pca.js';

const response = fs.readFileSync(path.resolve(__dirname, '../tests/fixtures/pca.txt'), 'utf-8');

const result = extractDirectoryJson(response);

describe('extractDirectoryJson', () => {
	it('should extract JSON from the given text', () => {
		expect(result).toBeDefined();
		expect(result?.mapRS).toBeDefined();
		expect(result?.dataRS).toBeDefined();
		expect(result?.mapRS.length).toBeGreaterThan(0);
		expect(result?.dataRS.length).toBeGreaterThan(0);
	});
});

describe('extractChurchData', () => {
	if (!result) {
		throw new Error('No result from extractDirectoryJson');
	}

	const churchData = extractChurchData(result);

	it('should extract church data from the JSON', () => {
		expect(churchData).toBeDefined();
		expect(churchData.length).toBeGreaterThan(0);

		const firstChurch = churchData[0];
		expect(firstChurch).toHaveProperty('id');
		expect(firstChurch).toHaveProperty('lon');
		expect(firstChurch).toHaveProperty('lat');
		expect(firstChurch).toHaveProperty('name');
		expect(firstChurch).toHaveProperty('website');
		expect(firstChurch).toHaveProperty('address');
		expect(firstChurch).toHaveProperty('pastor');
		expect(firstChurch).toHaveProperty('phone');
		expect(firstChurch).toHaveProperty('email');
		expect(firstChurch).toHaveProperty('presbyteryId');
	});

	it('should contain First Presbyterian Church with expected data', () => {
		if (!result) {
			throw new Error('No result from extractDirectoryJson');
		}

		const expected = {
			name: 'First Presbyterian Church',
			address: 'One West Harker Road Ft Oglethorpe GA 30742',
			lat: 34.944013,
			lon: -85.2555144,
			website: 'https://www.fpfo.org',
			email: 'office@fpfo.org',
		};
		const found = churchData.find(
			(church) =>
				church.name === expected.name &&
				church.address === expected.address &&
				Math.abs(church.lat - expected.lat) < 0.0001 &&
				Math.abs(church.lon - expected.lon) < 0.0001 &&
				church.website === expected.website &&
				church.email === expected.email,
		);

		expect(found).toBeDefined();
	});

	it('should have unique IDs for each church', () => {
		if (!result) {
			throw new Error('No result from extractDirectoryJson');
		}

		const ids = churchData.map((church) => church.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);

		// re-run extractChurchData and ensure that all the ids match the ids in churchData
		const reExtractedChurchData = extractChurchData(result);

		expect(reExtractedChurchData.length).toBe(churchData.length);
		reExtractedChurchData.forEach((church, index) => {
			expect(church.id).toBe(churchData[index].id);
		});
	});
});
