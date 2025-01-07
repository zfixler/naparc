import { v5 as uuidv5 } from 'uuid';
import { batchUpsertCongregations, delayFetch } from '../utils/index.js';

const denominationNamespace = 'e2b89f6e-17c4-40c5-8d97-381723ab732a';

async function fetchArpData() {
	const arpData = [];

	const coordinates = [
		{ lat: 49.2827, long: -123.1207 }, // Vancouver, Canada
		{ lat: 51.0447, long: -114.0719 }, // Calgary, Canada
		{ lat: 53.5461, long: -113.4938 }, // Edmonton, Canada
		{ lat: 45.5017, long: -73.5673 }, // Montreal, Canada
		{ lat: 43.65107, long: -79.347015 }, // Toronto, Canada
		{ lat: 40.7128, long: -74.006 }, // New York, USA
		{ lat: 34.0522, long: -118.2437 }, // Los Angeles, USA
		{ lat: 41.8781, long: -87.6298 }, // Chicago, USA
		{ lat: 29.7604, long: -95.3698 }, // Houston, USA
		{ lat: 33.4484, long: -112.074 }, // Phoenix, USA
		{ lat: 39.7392, long: -104.9903 }, // Denver, USA
		{ lat: 32.7157, long: -117.1611 }, // San Diego, USA
		{ lat: 47.6062, long: -122.3321 }, // Seattle, USA
		{ lat: 25.7617, long: -80.1918 }, // Miami, USA
		{ lat: 44.9778, long: -93.265 }, // Minneapolis, USA
		{ lat: 39.9526, long: -75.1652 }, // Philadelphia, USA
		{ lat: 33.749, long: -84.388 }, // Atlanta, USA
		{ lat: 42.3601, long: -71.0589 }, // Boston, USA
		{ lat: 45.4215, long: -75.6972 }, // Ottawa, Canada
		{ lat: 49.8951, long: -97.1384 }, // Winnipeg, Canada
		{ lat: 46.8139, long: -71.2082 }, // Quebec City, Canada
		{ lat: 53.7267, long: -127.6476 }, // Prince George, Canada
		{ lat: 60.7212, long: -135.0568 }, // Whitehorse, Canada
		{ lat: 64.2008, long: -149.4937 }, // Fairbanks, USA
		{ lat: 58.3019, long: -134.4197 }, // Juneau, USA
		{ lat: 21.3069, long: -157.8583 }, // Honolulu, USA
	];

	for await (const coordinate of coordinates) {
		await delayFetch();

		const url = `https://arpchurch.org/wp-admin/admin-ajax.php?action=store_search&lat=${coordinate.lat}&lng=${coordinate.long}&max_results=100&search_radius=500`;
		const res = await fetch(url);
		const data = await res.json();

		arpData.push(data);
	}

	return arpData.flat();
}

async function buildArpDenomination() {
	const data = await fetchArpData().catch((error) => console.log(error));

	/** @type {Array<import('@prisma/client').Congregation>} */
	const results = [];

	if (data) {
		data.forEach((obj) => {
			const cong = {
				id: uuidv5(`arpc-${obj?.id}`, denominationNamespace),
				name: obj?.store,
				pastor: obj?.fax?.replace('Rev.', '').trim(),
				address: `${obj?.address}, ${obj?.city}, ${obj?.state} ${obj?.zip}`,
				phone: obj?.phone,
				website: obj?.url,
				email: obj?.email,
				addressLabel: `${obj?.address} <br> ${obj?.city}, ${obj?.state} ${obj?.zip}`,
				contact: null,
				presbyteryId: null,
				denominationSlug: 'arpc',
				lat: parseFloat(obj?.lat),
				lon: parseFloat(obj?.lng),
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			if (cong?.lat) results.push(cong);
		});
	}

	const depuplicatedResults = results.filter(
		(value, index, self) => self.findIndex((v) => v.id === value.id) === index,
	);

	await batchUpsertCongregations(depuplicatedResults);

	return depuplicatedResults.length;
}

export default buildArpDenomination;
