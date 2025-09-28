import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { getDenomination } from '../src/lib/scrapers/scripts/urcna';

const html = fs.readFileSync(path.resolve(__dirname, '../tests/fixtures/urcna.html'), 'utf-8');

describe('extractChurchData', () => {
	const churchData = getDenomination(html);
	fs.writeFileSync(
		path.resolve(__dirname, '../tests/urcna.json'),
		JSON.stringify(churchData, null, 4),
	);
	it('should extract church data from the HTML', () => {
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

	it('should contain Adoration United Reformed Church with expected data', () => {
		const expected = {
			name: 'Adoration United Reformed Church',
			website: 'https://www.adorationurc.ca',
			email: 'clerk@adorationurc.ca',
			pastor: 'Bryce De Zwarte',
		};
		const found = churchData.find(
			(church) =>
				church?.name === expected.name &&
				church?.pastor === expected.pastor &&
				church?.website === expected.website &&
				church?.email === expected.email,
		);
		expect(found).toBeDefined();
	});

	it('should have unique IDs for each church', () => {
		const ids = churchData.map((church) => church?.id);
		const uniqueIds = new Set(ids);

		expect(uniqueIds.size).toBe(ids.length);

		// re-run extractChurchData and ensure that all the ids match the ids in churchData
		const reExtractedChurchData = getDenomination(html);

		expect(reExtractedChurchData.length).toBe(churchData.length);
		reExtractedChurchData.forEach((church, index) => {
			expect(church?.id).toBe(churchData[index]?.id);
		});
	});
});
