import { PrismaClient } from '@prisma/client';

// Add a type to globalThis to include 'prisma'
/**
 * @type {typeof globalThis & { prisma?: import('@prisma/client').PrismaClient }}
 */
const globalForPrismaTyped = globalThis;

export const prisma = globalForPrismaTyped.prisma ?? new PrismaClient();

globalForPrismaTyped.prisma = prisma;
