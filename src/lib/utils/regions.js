const CANADIAN_PROVINCE_CODES = new Set([
	'AB',
	'BC',
	'MB',
	'NB',
	'NL',
	'NS',
	'NT',
	'NU',
	'ON',
	'PE',
	'QC',
	'SK',
	'YT',
]);

const US_STATE_TERRITORY_CODES = new Set([
	'AK',
	'AL',
	'AR',
	'AS',
	'AZ',
	'CA',
	'CO',
	'CT',
	'DC',
	'DE',
	'FL',
	'GA',
	'GU',
	'HI',
	'IA',
	'ID',
	'IL',
	'IN',
	'KS',
	'KY',
	'LA',
	'MA',
	'MD',
	'ME',
	'MI',
	'MN',
	'MO',
	'MP',
	'MS',
	'MT',
	'NC',
	'ND',
	'NE',
	'NH',
	'NJ',
	'NM',
	'NV',
	'NY',
	'OH',
	'OK',
	'OR',
	'PA',
	'PR',
	'RI',
	'SC',
	'SD',
	'TN',
	'TX',
	'UM',
	'UT',
	'VA',
	'VI',
	'VT',
	'WA',
	'WI',
	'WV',
	'WY',
]);

const REGION_ALIASES = new Map([['QB', 'QC']]);

/**
 * Count distinct US states and Canadian provinces represented by address labels.
 * @param {Array<{addressLabel?: string|null}>} congregations
 */
export function countRegions(congregations) {
	const usStates = new Set();
	const canadianProvinces = new Set();

	for (const { addressLabel } of congregations) {
		if (!addressLabel) continue;
		const lines = addressLabel.split('<br>');
		if (lines.length < 2) continue;
		const regionCode = (
			lines
				.slice(1)
				.join(' ')
				.match(/\b[A-Z]{2}\b/g) || []
		)
			.map((code) => REGION_ALIASES.get(code) || code)
			.find((code) => CANADIAN_PROVINCE_CODES.has(code) || US_STATE_TERRITORY_CODES.has(code));
		if (!regionCode) continue;

		if (CANADIAN_PROVINCE_CODES.has(regionCode)) {
			canadianProvinces.add(regionCode);
		} else if (US_STATE_TERRITORY_CODES.has(regionCode)) {
			usStates.add(regionCode);
		}
	}

	return { totalStates: usStates.size, totalProvinces: canadianProvinces.size };
}
