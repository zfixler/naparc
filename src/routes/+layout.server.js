import { prisma } from '$lib/prisma';

/** @type {import('@sveltejs/kit').Load} */
export async function load() {
	const denominations = await prisma.denomination.findMany({
		where: {
			presbyteries: {
				some: {
					id: {
						not: undefined,
					},
				},
			},
		},
	});

	return { denominations };
}
