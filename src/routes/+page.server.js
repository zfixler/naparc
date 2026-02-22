import { getPrisma } from '$lib/prisma.js';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const prisma = getPrisma();

	// Get total counts
	const [totalCongregations, denominationsWithData, congregations] = await Promise.all([
		prisma.congregation.count(),
		// Only count denominations that have at least one congregation
		prisma.congregation.findMany({
			distinct: ['denominationSlug'],
			select: { denominationSlug: true },
		}),
		// Get all congregations with addressLabel to parse states
		prisma.congregation.findMany({
			select: { addressLabel: true },
			where: { addressLabel: { not: null } },
		}),
	]);

	const totalDenominations = denominationsWithData.length;

	// Parse states/provinces from addressLabel (format: "address<br>city, state/province zip<br>country")
	// Separate US states from Canadian provinces
	const usStates = new Set();
	const canadianProvinces = new Set();

	// Canadian province codes for reference
	const canadianProvinceCodes = new Set([
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

	for (const congregation of congregations) {
		if (congregation.addressLabel) {
			// Split by <br> to get address lines
			const lines = congregation.addressLabel.split('<br>');
			if (lines.length >= 2) {
				// Extract state/province code from "city, state/province zip" format
				// US format: "City, ST 12345" or Canadian format: "City, PR A1B 2C3"
				const cityStateZip = lines[1];
				const match = cityStateZip.match(/,\s*([A-Z]{2})\s+[A-Z0-9]/);

				if (match) {
					const regionCode = match[1];
					// Check country (third line) to determine if it's US or Canada
					const country = lines[2]?.trim().toLowerCase() || '';

					// Check if it's Canada by country field or by province code
					if (
						country.includes('canada') ||
						country === 'ca' ||
						country === 'can' ||
						canadianProvinceCodes.has(regionCode)
					) {
						canadianProvinces.add(regionCode);
					} else {
						usStates.add(regionCode);
					}
				}
			}
		}
	}

	return {
		stats: {
			totalCongregations,
			totalDenominations,
			totalStates: usStates.size,
			totalProvinces: canadianProvinces.size,
		},
	};
}
