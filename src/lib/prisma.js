import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Cache the Prisma client and pool to avoid multiple connections
let prismaInstance = null;
let poolInstance = null;

export function getPrisma() {
	if (prismaInstance) {
		return prismaInstance;
	}

	// Create a connection pool only once
	if (!poolInstance) {
		poolInstance = new pg.Pool({
			connectionString: process.env.DATABASE_URL,
		});
	}

	const adapter = new PrismaPg(poolInstance);

	prismaInstance = new PrismaClient({
		log: ['error'],
		adapter,
	});

	return prismaInstance;
}
