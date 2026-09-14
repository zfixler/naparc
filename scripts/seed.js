import { denominations } from '../config/denominations.js';
import { batchD1 } from './d1-client.js';
import { v5 as uuidv5 } from 'uuid';

const NAMESPACE = 'ee9a390a-c36e-4d12-a121-a27384e96b06';

async function main() {
	console.log('Seeding production D1 database...');
	const statements = [];
	for (const denomination of denominations) {
		statements.push({
			sql: `INSERT INTO Denomination (id, slug, name, abbr, continental, description)
				VALUES (?, ?, ?, ?, ?, ?)
				ON CONFLICT(slug) DO UPDATE SET name = excluded.name, abbr = excluded.abbr,
				continental = excluded.continental, description = excluded.description`,
			params: [
				uuidv5(`denomination:${denomination.slug}`, NAMESPACE),
				denomination.slug,
				denomination.name,
				denomination.abbr,
				denomination.continental ? 1 : 0,
				denomination.description,
			],
		});
		statements.push({
			sql: `INSERT INTO ScrapeLog (id, denominationSlug) VALUES (?, ?)
				ON CONFLICT(denominationSlug) DO NOTHING`,
			params: [uuidv5(`scrape-log:${denomination.slug}`, NAMESPACE), denomination.slug],
		});
	}
	await batchD1(statements);
	console.log(`Seeded ${denominations.length} denominations.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
