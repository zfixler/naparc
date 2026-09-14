import { describe, expect, it } from 'vitest';
import { countRegions } from '../src/lib/utils/regions.js';

describe('countRegions', () => {
	it('counts distinct US states and Canadian provinces', () => {
		expect(
			countRegions([
				{ addressLabel: '1 Main St<br>Boston, MA 02108<br>United States' },
				{ addressLabel: '2 Main St<br>Cambridge, MA 02139<br>United States' },
				{ addressLabel: '3 Main St<br>Toronto, ON M5V 2T6<br>Canada' },
				{ addressLabel: '4 Main St<br>Calgary, AB T2P 1J9' },
			]),
		).toEqual({ totalStates: 1, totalProvinces: 2 });
	});

	it('ignores missing and unrecognized address labels', () => {
		expect(
			countRegions([{ addressLabel: null }, { addressLabel: 'No structured address' }]),
		).toEqual({ totalStates: 0, totalProvinces: 0 });
	});
});
