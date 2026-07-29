import puppeteer from 'puppeteer';

/**
 * Launches Chrome for sites behind a Cloudflare managed challenge.
 *
 * The challenge does not clear in headless Chrome — it stays on "Just a
 * moment..." indefinitely — but clears immediately in headed Chrome, including
 * from GitHub Actions' datacenter IPs. CI therefore runs the scrapers under
 * `xvfb-run` to provide the display headed Chrome needs.
 *
 * @returns {Promise<import('puppeteer').Browser>}
 */
export async function launchChallengeBrowser() {
	return puppeteer.launch({
		headless: false,
		args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
	});
}

/**
 * Waits for a Cloudflare interstitial to hand over to the real page.
 * @param {import('puppeteer').Page} page
 * @param {number} timeout
 */
export async function waitForChallenge(page, timeout = 45000) {
	await page.waitForFunction(() => !document.title.includes('Just a moment'), { timeout });
}
