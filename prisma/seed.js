import { PrismaClient } from '@prisma/client';
import { denominations } from '../config/denominations.js';

const prisma = new PrismaClient();

async function main() {
	console.log('Start seeding...');

	for (const d of denominations) {
		const denomination = await prisma.denomination.create({
			data: {
				name: d.name,
				slug: d.slug,
				abbr: d.abbr,
				description: d.description,
				continental: d.continental,
			},
		});

		console.log(`Created ${denomination.abbr} with id: ${denomination.id}.`);

		const scrapeLog = await prisma.scrapeLog.create({
			data: {
				denominationSlug: denomination.slug,
			},
		});

		console.log(`Created scrape log for ${denomination.abbr} with id: ${scrapeLog.id}.`);
	}

	console.log('Seed complete.');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
