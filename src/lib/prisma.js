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
		const connectionString = process.env.DATABASE_URL;

		if (!connectionString) {
			throw new Error('DATABASE_URL environment variable is not set');
		}

		poolInstance = new pg.Pool({
			connectionString,
			ssl: {
				rejectUnauthorized: false,
			},
		});
	}

	const adapter = new PrismaPg(poolInstance);

	prismaInstance = new PrismaClient({
		log: ['error'],
		adapter,
	});

	return prismaInstance;
}
