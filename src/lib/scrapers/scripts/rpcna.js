import * as cheerio from 'cheerio';
import { v5 as uuidv5 } from 'uuid';
import { batchUpsertCongregations, slugify } from '../utils/index.js';
import { launchChallengeBrowser } from '../utils/browser.js';

/**
 * Extracts congregation URLs from HTML content.
 * @param {string} html - The HTML content to parse.
 * @returns {Array<{url: string, slug: string}>} An array of objects containing the URL and its slug.
 */
function getCongregationUrls(html) {
	const $ = cheerio.load(html);
	/** @type {Array<{url: string, slug: string}>} */
	const urls = [];

	// The directory also contains mailto: anchors, so match congregation links
	// only. The path moved from /congregations/show/ to /congregations/info/;
	// the trailing slug is unchanged, which keeps generated ids stable.
	$('.church_directory')
		.find('a[href^="/congregations/info/"]')
		.each((i, el) => {
			const url = $(el).attr('href');
			const result = {
				url: `https://reformedpresbyterian.org${url}`,
				slug: url?.replace('/congregations/info/', '') || '',
			};
			urls.push(result);
		});
	return urls;
}

/**
 * Parses latitude and longitude values from a string.
 * @param {string} string - The input string containing latitude and longitude in the format "[latitude, longitude]".
 * @returns {Array<Number>} An array containing latitude and longitude values.
 */
function parseLatLong(string) {
	const pattern = /\[(.*?)\]/;
	const match = string.match(pattern);
	if (!match) return [];

	const values = match[1].split(',');
	return values.map((str) => parseFloat(str));
}

/**
 * Parse congregations individually and return an array of all
 * @param {Array<{url: string, slug: string}>} urls
 * @param {Record<string, string>} headers - Session headers carrying the Cloudflare clearance cookie.
 */
async function getDenomination(urls, headers) {
	const denomination = [];
	const denominationNamespace = 'c35c0255-08b6-4e51-b4ee-ca473f2ad981';
	const denominationSlug = 'rpcna';

	// Parallelize fetches
	const congregationPromises = urls.map(async (congregation) => {
		try {
			const response = await fetch(congregation.url, { headers });

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.text();
			const $ = cheerio.load(data);
			const mapScript = $('.map_search_container').find('script').text();
			const infoDiv = $('.church_info');
			const pastorDiv = $('.cong_pastor');
			const h1 = $('.page-title');
			const presbyteryHeader = $('.header-breadcrumb');
			const addressDiv = $('.address');
			const addressInput = $('[name="daddr"]');

			const [lat, lon] = parseLatLong(mapScript);

			let phone = null;
			let website = null;
			let email = null;

			$('#main-wrapper')
				.contents()
				.each((i, el) => {
					if ($(el).text().includes('@')) email = $(el).text();
				});

			const pastor = pastorDiv.text().split(',')[0].trim();
			const name = h1.text().trim();
			const separators = /[,\n]/;
			const addressLabel = addressDiv
				.text()
				.split(separators)
				.map((str) => str.trim())
				.filter((val) => Boolean(val))
				.join('<br>');

			const address = addressInput.attr('value') || null;
			const presbytery = presbyteryHeader.children('a').last().text().trim();
			const presbyteryUuid = uuidv5(String(presbytery), denominationNamespace);
			const id = uuidv5(congregation.slug, presbyteryUuid);

			infoDiv.find('th').each((i, el) => {
				const element = $(el);
				if (element.text().includes('Phone')) phone = element.next().text().trim();
				if (element.text().includes('Website')) website = element.next().find('a').attr('href');
			});

			denomination.push({
				id,
				pastor,
				name,
				email,
				address,
				addressLabel,
				phone,
				website,
				lat,
				lon,
				presbyteryId: presbyteryUuid,
				presbytery: {
					denominationSlug,
					name: presbytery,
					id: presbyteryUuid,
					slug: slugify(presbytery),
				},
				denominationSlug,
				contact: null,
				updatedAt: null,
				createdAt: null,
			});
		} catch (error) {
			console.error(`Failed to fetch or parse ${congregation.url}:`, error);
			return null; // Skip failed congregations
		}
	});

	const results = await Promise.all(congregationPromises);
	// Filter out nulls (failed fetches)
	denomination.push(...results.filter(Boolean));

	return denomination;
}

/**
 * The RPCNA site sits behind a Cloudflare challenge that a plain fetch cannot
 * pass. Clear it once in a real browser, then hand the resulting clearance
 * cookie to the per-congregation fetches so they do not each need a browser.
 * @returns {Promise<{html: string, headers: Record<string, string>}>}
 */
async function fetchListPageWithClearance() {
	console.log('Launching browser for RPCNA scraper...');
	const browser = await launchChallengeBrowser();

	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080 });

		console.log('Navigating to RPCNA congregation list...');
		await page.goto('https://reformedpresbyterian.org/congregations/list/', {
			waitUntil: 'networkidle2',
			timeout: 60000,
		});

		// The challenge page has no directory markup, so waiting for a real
		// congregation link is what tells us the clearance actually landed.
		console.log('Waiting for Cloudflare challenge to clear...');
		await page.waitForSelector('.church_directory a[href^="/congregations/info/"]', {
			timeout: 45000,
		});

		const html = await page.content();
		const userAgent = await browser.userAgent();
		const cookies = await browser.cookies();
		const cookieHeader = cookies.map(({ name, value }) => `${name}=${value}`).join('; ');

		return {
			html,
			headers: { 'cookie': cookieHeader, 'user-agent': userAgent },
		};
	} finally {
		await browser.close();
	}
}

async function buildRpcnaDenomination() {
	const { html, headers } = await fetchListPageWithClearance();
	const congregationUrls = getCongregationUrls(html);

	if (congregationUrls.length === 0) {
		throw new Error('Found no congregation links on the RPCNA list page.');
	}

	console.log(`Found ${congregationUrls.length} congregation urls`);
	const denomination = await getDenomination(congregationUrls, headers);

	await batchUpsertCongregations(denomination.filter((church) => church != null));

	return denomination.length;
}

export default buildRpcnaDenomination;
