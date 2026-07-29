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
 * @param {Array<{url: string, slug: string, html: string}>} pages - Congregation pages already fetched through the browser session.
 */
async function getDenomination(pages) {
	const denomination = [];
	const denominationNamespace = 'c35c0255-08b6-4e51-b4ee-ca473f2ad981';
	const denominationSlug = 'rpcna';

	const congregationPromises = pages.map(async (congregation) => {
		try {
			const $ = cheerio.load(congregation.html);
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
 * pass. The clearance is bound to the browser session rather than just the
 * cookie, so the congregation pages are fetched from inside the cleared page
 * instead of being handed off to Node.
 * @returns {Promise<Array<{url: string, slug: string, html: string}>>}
 */
async function fetchCongregationPages() {
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

		const congregationUrls = getCongregationUrls(await page.content());

		if (congregationUrls.length === 0) {
			throw new Error('Found no congregation links on the RPCNA list page.');
		}

		console.log(`Found ${congregationUrls.length} congregation urls`);

		const pages = await page.evaluate(async (targets) => {
			const collected = [];
			const concurrency = 5;

			for (let i = 0; i < targets.length; i += concurrency) {
				const batch = await Promise.all(
					targets.slice(i, i + concurrency).map(async (target) => {
						const res = await fetch(target.url);
						return res.ok ? { ...target, html: await res.text() } : null;
					}),
				);
				collected.push(...batch.filter(Boolean));
			}

			return collected;
		}, congregationUrls);

		console.log(`Fetched ${pages.length} of ${congregationUrls.length} congregation pages`);

		return pages;
	} finally {
		await browser.close();
	}
}

async function buildRpcnaDenomination() {
	const pages = await fetchCongregationPages();
	const denomination = await getDenomination(pages);

	await batchUpsertCongregations(denomination.filter((church) => church != null));

	return denomination.length;
}

export default buildRpcnaDenomination;
