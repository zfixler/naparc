import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import { upsertCongregation, slugify } from '../utils/service.js';

async function buildUrcnaDenomination() {
	const url =
		'https://www.urcna.org/sysfiles/member/family/urcna_report.cfm?memberid=1651&public=1';
	const response = await fetch(url);
	const data = await response.text();
	const $ = cheerio.load(data);

	/** @type {Array<string>} */
	const tableData = [];

	$('#myList')
		.find('a')
		.each((i, el) => {
			const element = $(el);
			if (element.text().includes('More Information')) {
				const href = element.attr('href') || '';
				if (href) tableData.push(href);
			}
		});

	const denominationSlug = 'urcna';
	const denominationNamespace = '88bd409f-0593-4177-85a1-e8e326cb3689';

	const denomination = tableData.map((uri) => {
		const decoded = decodeURI(uri);
		const valuesArray = decoded.split('&').map((str) => str.split('='));
		const address =
			`${valuesArray[3][1]}, ${valuesArray[4][1]}, ${valuesArray[5][1]}, ${valuesArray[6][1]} ${valuesArray[7][1]}`.trim();
		const addressLabel =
			`${valuesArray[3][1]}<br>${valuesArray[4][1]}, ${valuesArray[5][1]} ${valuesArray[6][1]} ${valuesArray[7][1]}`.trim();
		const presbytery = valuesArray[2][1];
		const presbyteryUuid = uuidv5(presbytery, denominationNamespace);
		const id = uuidv5(valuesArray[0][1], presbyteryUuid)
		return {
			id,
			name: valuesArray[1][1],
			address,
			addressLabel,
			website: 'https://' + valuesArray[15][1].replace('http%3A%2F%2F', ''),
			phone: valuesArray[12][1],
			email: valuesArray[14][1].replace('%40', '@'),
			pastor: valuesArray[17][1].replace('Rev. ', ''),
			lat: valuesArray[20][1],
			long: valuesArray[21][1],
			presbyteryId: presbyteryUuid,
			presbytery: {
				id: presbyteryUuid,
				name: presbytery,
				denominationSlug,
				slug: slugify(presbytery),
			},
			contact: null,
            updatedAt: null,
            createdAt: null,
		};
	});

	for await (const congregation of denomination) {
		if (congregation.id) upsertCongregation(congregation);
	}

	return denomination.length;
};

export default buildUrcnaDenomination;