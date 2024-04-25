import { prisma } from '$lib/prisma';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const presbytery = await prisma.presbytery.findMany({
		where: {
			denominationSlug: params.denomination,
			slug: params.presbytery,
		},
		include: {
			congregations: true,
			denomination: true,
		},
	});
	return {
		/** @type {import("@prisma/client").Presbytery & {denomination: import("@prisma/client").Denomination} & {congregations: import("@prisma/client").Congregation[]}}*/
		presbytery: presbytery[0],
	};
}
