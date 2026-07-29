/**
 * TEMPORARY validation. Exercises the browser-based ARP and RPCNA data
 * acquisition from inside GitHub Actions, without writing to the database.
 * Delete once the approach is confirmed.
 */
import * as cheerio from 'cheerio';
import { launchChallengeBrowser } from '../src/lib/scrapers/utils/browser.js';

function header(title) {
	console.log(`\n${'='.repeat(60)}\n${title}\n${'='.repeat(60)}`);
}

/** Inspect what ARP's challenge actually renders, and how long it persists. */
async function inspectArp() {
	header('ARP: what does the challenge look like in headed Chrome?');
	const browser = await launchChallengeBrowser();
	try {
		const page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080 });
		await page.goto('https://arpchurch.org/', { waitUntil: 'domcontentloaded', timeout: 60000 });

		for (const seconds of [5, 15, 30, 60]) {
			await new Promise((r) => setTimeout(r, seconds === 5 ? 5000 : 10000));
			const state = await page.evaluate(() => ({
				title: document.title,
				turnstile: !!document.querySelector('iframe[src*="challenges.cloudflare.com"]'),
				bodyStart: (document.body.innerText || '').slice(0, 120).replace(/\s+/g, ' '),
			}));
			console.log(`t≈${seconds}s`, JSON.stringify(state));
			if (!state.title.includes('Just a moment')) {
				console.log('RESULT: ARP challenge cleared');
				break;
			}
		}

		// Does hitting the JSON endpoint directly behave differently?
		const direct = await page.goto(
			'https://arpchurch.org/wp-admin/admin-ajax.php?action=store_search&lat=34.0522&lng=-118.2437&max_results=100&search_radius=500',
			{ waitUntil: 'domcontentloaded', timeout: 60000 },
		);
		console.log('direct endpoint status:', direct?.status());
		const text = await page.evaluate(() => document.body.innerText.slice(0, 200));
		console.log('direct endpoint body:', JSON.stringify(text));
	} finally {
		await browser.close();
	}
}

/** Confirm RPCNA works fully inside the browser session. */
async function validateRpcna() {
	header('RPCNA: list + details fetched inside the cleared page');
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

		const html = await page.content();
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
		console.log('congregation urls:', urls.length);

		// Fetch a small sample the same way the scraper does.
		const sample = urls.slice(0, 5);
		const pages = await page.evaluate(async (targets) => {
			const collected = [];
			for (const target of targets) {
				const res = await fetch(target.url);
				collected.push({
					slug: target.slug,
					status: res.status,
					html: res.ok ? await res.text() : '',
				});
			}
			return collected;
		}, sample);

		console.log('statuses:', pages.map((p) => p.status).join(', '));

		const parsed = pages
			.filter((p) => p.html)
			.map((p) => {
				const $$ = cheerio.load(p.html);
				return {
					slug: p.slug,
					name: $$('.page-title').text().trim(),
					pastor: $$('.cong_pastor').text().split(',')[0].trim(),
					address: $$('[name="daddr"]').attr('value') || null,
					presbytery: $$('.header-breadcrumb').children('a').last().text().trim(),
					hasLatLon: /\[(.*?)\]/.test($$('.map_search_container').find('script').text()),
				};
			});
		console.log('RESULT: parsed', parsed.length, 'of', sample.length);
		console.log(JSON.stringify(parsed, null, 2));
	} finally {
		await browser.close();
	}
}

let failed = false;
for (const [name, fn] of [
	['ARP', inspectArp],
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
