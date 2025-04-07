import fs from 'fs';
import { scrapeOpcPresbytery } from '../src/server/scrapers/opc.js';
import output from './fixtures/opc.json';

// use fs to read the html file in the fixtures folder
import { describe, expect, it } from 'vitest';

import path from 'path';

const html = fs.readFileSync(path.resolve(__dirname, '../tests/fixtures/opc.html'), 'utf-8');

describe('scrapeOpcPresbytery', () => {
	it('should scrape the correct data from the given HTML', () => {
		const result = scrapeOpcPresbytery(html);

		expect(result).toEqual(output);
	});
});
