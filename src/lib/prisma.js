import { PrismaClient } from '@prisma/client';

export function getPrisma() {
	return new PrismaClient({
		log: ['error'],
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
	});
}
