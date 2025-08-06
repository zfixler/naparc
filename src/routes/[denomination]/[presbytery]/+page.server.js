import { prisma } from '$lib/prisma';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const presbytery = await prisma.presbytery.findUnique({
		where: {
			slugs: {
				denominationSlug: params.denomination,
				slug: params.presbytery,
			},
		},
		include: {
			congregations: true,
			denomination: true,
		},
	});

	if (!presbytery) {
		error(404, 'Not found');
	}

	return { presbytery };
}
