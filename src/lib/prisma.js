import { PrismaClient } from '@prisma/client';

// Add a type to globalThis to include 'prisma'
/**
 * @type {typeof globalThis & { prisma?: import('@prisma/client').PrismaClient }}
 */
const globalForPrismaTyped = globalThis;

export const prisma =
	globalForPrismaTyped.prisma ??
	new PrismaClient({
		log: ['error'],
		// Configure connection pooling for serverless environments
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
	});

globalForPrismaTyped.prisma = prisma;
