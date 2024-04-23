import { prisma } from '$lib/prisma';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const presbytery = await prisma.presbytery.findUnique({
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
