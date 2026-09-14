import { describe, expect, it } from 'vitest';
import { haversineMiles } from '../src/lib/utils/server.js';

describe('haversineMiles', () => {
	it('returns zero for identical coordinates', () => {
		expect(haversineMiles(40, -75, 40, -75)).toBe(0);
	});

	it('calculates a representative city-to-city distance in miles', () => {
		const distance = haversineMiles(40.7128, -74.006, 39.9526, -75.1652);
		expect(distance).toBeGreaterThan(79);
		expect(distance).toBeLessThan(82);
	});
});
