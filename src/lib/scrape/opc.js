import axios from 'axios';
import * as cheerio from 'cheerio';
import FormData from 'form-data';
import { prisma } from '../prisma.js';
import {
	getChurchId,
	getPastorName,
	getContactEmailAddress,
	getContactName,
	getContactPhoneNumber,
	getWebsiteUrl,
} from './utils.js';

/**
 * Initiate scrape of OPC directory and upsert congregations inside the database.
 */
async function scrapeOpcDenomination() {
const presbyteryIds = [
	'1',
	'2',
	'3',
	'4',
	'5',
	'6',
	'7',
	'8',
	'9',
	'10',
	'11',
	'12',
	'13',
	'14',
	'15',
	'16',
	'17',
	'18',
];

/**
 * @param {string} presbyteryId
 */
async function makeRequest(presbyteryId) {
	let data = new FormData();
	data.append('search_go', 'Y');
	data.append('presbytery_id', presbyteryId);

	let config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: 'https://opc.org/locator.html',
		headers: {
			...data.getHeaders(),
		},
		data: data,
	};

	try {
		const response = await axios.request(config);
		return await response.data;
	} catch (error) {
		console.log(error);
	}
}

/**
 * Fetch all congregations in a given presbytery
 * @param {string} presbyteryId
 * @returns {Promise<object[]>}
 */
async function fetchCongregations(presbyteryId) {
	const html = await makeRequest(presbyteryId);

	const $ = cheerio.load(html);
	const mapScript = $(`script:contains("AddPointQ")`).text();
	const regexPattern = /AddPointQ\((.*?)\);/g;
	const captures = mapScript.match(regexPattern);

	const congregations = captures?.map((capture) => {
		const detailsArray = capture.split("'");
		const long = detailsArray[1];
		const lat = detailsArray[3];
		const detailsNode = cheerio.load(detailsArray[7]);
		const name = detailsNode('h5').text();
		const site = getWebsiteUrl(detailsArray[7]);
		const address = detailsNode('p:first').html();
		const key = site ? site : name;
		const table = $(`.ChurchDirMore:contains(${key})`).html();
		const pastor = getPastorName(table);
		const contact = pastor ? pastor : getContactName(table);
		const email = getContactEmailAddress(table);
		const phone = getContactPhoneNumber(table);
		const congregation = {
			id: `opc_${getChurchId(table)}`,
			denominationSlug: 'opc',
			long,
			lat,
			name,
			site,
			address,
			pastor,
			contact,
			email,
			phone,
		};

		return congregation;
	});
	return congregations || [];
}

  /**
   * Variable for all congregations in denomination
   * @type {Array<any>}
   */
  let denomination = [];
  
  for await (const presbyteryId of presbyteryIds) {
    const presbytery = await fetchCongregations(presbyteryId).catch((err) =>
      console.log(err)
    );
    denomination = denomination.concat(presbytery);
  }
  
  for await (const congregation of denomination) {
    if (congregation && !congregation.id.includes('undefined')) {
      await prisma.congregation.upsert({
        where: {
          id: congregation.id,
        },
        update: {
          long: congregation.long,
          lat: congregation.lat,
          name: congregation.name,
          website: congregation.site,
          address: congregation.address,
          pastor: congregation.pastor,
          contact: congregation.contact,
          email: congregation.email,
          phone: congregation.phone,
          denominationSlug: congregation.denominationSlug,
        },
        create: {
          id: congregation.id,
          denominationSlug: congregation.denominationSlug,
          long: congregation.long,
          lat: congregation.lat,
          name: congregation.name,
          website: congregation.site,
          address: congregation.address,
          pastor: congregation.pastor,
          contact: congregation.contact,
          email: congregation.email,
          phone: congregation.phone,
        },
      });
    }
  }
}

export default scrapeOpcDenomination;

