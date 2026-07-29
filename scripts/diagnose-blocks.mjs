/**
 * TEMPORARY validation. Exercises the browser-based ARP and RPCNA data
 * acquisition from inside GitHub Actions, without writing to the database.
 * Delete once the approach is confirmed.
 */
import * as cheerio from 'cheerio';
import { launchChallengeBrowser, waitForChallenge } from '../src/lib/scrapers/utils/browser.js';

function header(title) {
	console.log(`\n${'='.repeat(60)}\n${title}\n${'='.repeat(60)}`);
}

async function validateArp() {
	header('ARP: store_search via headed browser');
	const browser = await launchChallengeBrowser();
	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080 });
		await page.goto('https://arpchurch.org/', { waitUntil: 'networkidle2', timeout: 60000 });
		await waitForChallenge(page);
		console.log('challenge cleared, title:', await page.title());

		// Two coordinates is enough to prove the transport works.
		const coords = [
			{ lat: 34.0522, long: -118.2437 },
			{ lat: 33.749, long: -84.388 },
		];
		const data = await page.evaluate(async (cs) => {
			const collected = [];
			for (const c of cs) {
				const url = `/wp-admin/admin-ajax.php?action=store_search&lat=${c.lat}&lng=${c.long}&max_results=100&search_radius=500`;
				const res = await fetch(url);
				const ct = res.headers.get('content-type') || 'unknown';
				if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
				if (!ct.includes('application/json')) throw new Error(`non-JSON (${ct}) for ${url}`);
				collected.push(...(await res.json()));
			}
			return collected;
		}, coords);

		console.log('RESULT: records returned:', data.length);
		console.log('sample:', JSON.stringify(data[0] ?? null).slice(0, 200));
	} finally {
		await browser.close();
	}
}

async function validateRpcna() {
	header('RPCNA: list via headed browser + detail via cookie handoff');
	const browser = await launchChallengeBrowser();
	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080 });
		await page.goto('https://reformedpresbyterian.org/congregations/list/', {
			waitUntil: 'networkidle2',
			timeout: 60000,
		});
		await page.waitForSelector('.church_directory a[href^="/congregations/info/"]', {
			timeout: 45000,
		});
		console.log('challenge cleared, title:', await page.title());

		const html = await page.content();
		const userAgent = await browser.userAgent();
		const cookies = await browser.cookies();
		const cookieHeader = cookies.map(({ name, value }) => `${name}=${value}`).join('; ');

		const $ = cheerio.load(html);
		const urls = [];
		$('.church_directory')
			.find('a[href^="/congregations/info/"]')
			.each((i, el) => {
				const href = $(el).attr('href');
				urls.push({
					url: `https://reformedpresbyterian.org${href}`,
					slug: href?.replace('/congregations/info/', '') || '',
				});
			});
		console.log('RESULT: congregation urls:', urls.length);
		console.log('sample slug:', urls[0]?.slug);

		// The detail pages are fetched without a browser, so confirm the
		// clearance cookie actually carries over from this IP.
		const headers = { 'cookie': cookieHeader, 'user-agent': userAgent };
		const res = await fetch(urls[0].url, { headers });
		console.log('detail fetch status:', res.status);
		const detail = await res.text();
		const $$ = cheerio.load(detail);
		console.log('RESULT: detail parses:', {
			name: $$('.page-title').text().trim(),
			pastor: $$('.cong_pastor').text().split(',')[0].trim(),
			address: $$('[name="daddr"]').attr('value') || null,
			presbytery: $$('.header-breadcrumb').children('a').last().text().trim(),
			hasMapScript: $$('.map_search_container').find('script').text().length > 0,
		});
	} finally {
		await browser.close();
	}
}

let failed = false;
for (const [name, fn] of [
	['ARP', validateArp],
	['RPCNA', validateRpcna],
]) {
	try {
		await fn();
	} catch (error) {
		failed = true;
		console.log(`${name} FAILED:`, error.message);
	}
}

console.log('\nValidation complete.');
if (failed) process.exit(1);
