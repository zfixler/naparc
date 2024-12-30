import { prisma } from '$lib/prisma';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	const denominations = await prisma.denomination.findMany({
		select: {
			presbyteries: true,
			slug: true,
			name: true,
			description: true,
			id: true,
			_count: {
				select: {
					congregations: true,
				},
			},
		},
		orderBy: [
			{
				presbyteries: {
					_count: 'desc',
				},
			},
			{
				congregations: {
					_count: 'desc',
				},
			},
		],
	});

	return {
		denominations,
	};
}
