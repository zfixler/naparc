import { json } from '@sveltejs/kit';

export async function GET({ url: requestUrl }) {
	const input = requestUrl.searchParams.get('input');
	if (!input) return json({ error: 'No input provided' }, { status: 400 });

	const isPostalCode = /^\d{5}$|^[A-Za-z]\d[A-Za-z]/.test(input);

	const url = isPostalCode
		? `https://api.geoapify.com/v1/geocode/search?postcode=${input}&filter=countrycode:us,ca&format=json&apiKey=${process.env.GEOAPIFY_KEY}`
		: `https://api.geoapify.com/v1/geocode/autocomplete?text=${input}&type=city&filter=countrycode:us,ca&format=json&apiKey=${process.env.GEOAPIFY_KEY}`;

	try {
		const response = await fetch(url);
		const data = await response.json();
		return json(data);
	} catch (error) {
		console.error(error);
		return json({ error: 'Failed to fetch locations' }, { status: 500 });
	}
}
