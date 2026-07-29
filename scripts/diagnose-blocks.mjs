/**
 * TEMPORARY diagnostic. Determines, from inside GitHub Actions, how the ARP and
 * RPCNA sites respond to a datacenter IP. Delete once the findings are acted on.
 */
import puppeteer from 'puppeteer';

const UA =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const RPCNA_LIST = 'https://reformedpresbyterian.org/congregations/list/';
const ARP_ENDPOINT =
	'https://arpchurch.org/wp-admin/admin-ajax.php?action=store_search&lat=34.0522&lng=-118.2437&max_results=100&search_radius=500';

function header(title) {
	console.log(`\n${'='.repeat(60)}\n${title}\n${'='.repeat(60)}`);
}

async function checkArp() {
	header('1. ARP admin-ajax (plain fetch, default UA)');
	try {
		const res = await fetch(ARP_ENDPOINT);
		const body = await res.text();
		console.log('status:', res.status);
		console.log('content-type:', res.headers.get('content-type'));
		console.log('cf-mitigated:', res.headers.get('cf-mitigated'));
		console.log('server:', res.headers.get('server'));
		console.log('challenge page:', body.includes('Just a moment'));
		console.log('body preview:', JSON.stringify(body.slice(0, 200)));
	} catch (error) {
		console.log('threw:', error.message);
	}
}

async function checkArpBrowserUa() {
	header('2. ARP admin-ajax (plain fetch, browser UA)');
	try {
		const res = await fetch(ARP_ENDPOINT, { headers: { 'user-agent': UA } });
		const body = await res.text();
		console.log('status:', res.status);
		console.log('content-type:', res.headers.get('content-type'));
		console.log('challenge page:', body.includes('Just a moment'));
		console.log('body preview:', JSON.stringify(body.slice(0, 200)));
	} catch (error) {
		console.log('threw:', error.message);
	}
}

async function checkRpcnaFetch() {
	header('3. RPCNA list page (plain fetch, browser UA)');
	try {
		const res = await fetch(RPCNA_LIST, { headers: { 'user-agent': UA } });
		const body = await res.text();
		console.log('status:', res.status);
		console.log('cf-mitigated:', res.headers.get('cf-mitigated'));
		console.log('challenge page:', body.includes('Just a moment'));
		console.log('congregation links:', (body.match(/congregations\/info\//g) || []).length);
	} catch (error) {
		console.log('threw:', error.message);
	}
}

async function checkRpcnaBrowser(mode) {
	header(`${mode === true ? '4' : '5'}. RPCNA list page (puppeteer headless: ${mode})`);
	let browser;
	try {
		browser = await puppeteer.launch({
			headless: mode,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
		});
		const page = await browser.newPage();
		await page.setViewport({ width: 1920, height: 1080 });
		await page.goto(RPCNA_LIST, { waitUntil: 'networkidle2', timeout: 60000 });
		console.log('title after goto:', await page.title());

		try {
			await page.waitForSelector('.church_directory a[href^="/congregations/info/"]', {
				timeout: 40000,
			});
			const count = await page.evaluate(
				() => document.querySelectorAll('.church_directory a[href^="/congregations/info/"]').length,
			);
			console.log('RESULT: challenge cleared, congregation links:', count);
		} catch {
			console.log('RESULT: challenge did NOT clear within 40s');
			console.log('title now:', await page.title());
		}
	} catch (error) {
		console.log('threw:', error.message);
	} finally {
		await browser?.close();
	}
}

await checkArp();
await checkArpBrowserUa();
await checkRpcnaFetch();
await checkRpcnaBrowser(true);
await checkRpcnaBrowser(false);
console.log('\nDiagnostic complete.');
