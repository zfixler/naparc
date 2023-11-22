import { prisma } from '$lib/prisma';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const presbytery = prisma.presbytery.findUnique({
		where: {
			id: params.id,
		},
		include: {
			congregations: true,
            denomination: true,
		},
	});
	return {
		presbytery,
	};
}
