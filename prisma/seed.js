import { PrismaClient } from '@prisma/client';
import { denominations } from './denominations.js';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    for (const d of denominations) {
        const denomination = await prisma.denomination.upsert({
            where: {
              slug: d.slug,
            },
            update: {
              name: d.name,
              slug: d.slug,
              abbr: d.abbr,
              description: d.description,
            },
            create: {
                name: d.name,
                slug: d.slug,
                abbr: d.abbr,
                description: d.description,
            }
        });

        console.log(`Created ${ denomination.abbr } with id: ${ denomination.id}.`);
    }

    console.log('Seed complete.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })