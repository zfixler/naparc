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
		const match = lines[1].match(/,\s*([A-Z]{2})\s+[A-Z0-9]/);
		if (!match) continue;

		const regionCode = match[1];
		const country = lines[2]?.trim().toLowerCase() || '';
		if (
			country.includes('canada') ||
			country === 'ca' ||
			country === 'can' ||
			CANADIAN_PROVINCE_CODES.has(regionCode)
		) {
			canadianProvinces.add(regionCode);
		} else {
			usStates.add(regionCode);
		}
	}

	return { totalStates: usStates.size, totalProvinces: canadianProvinces.size };
}
