import { describe, expect, it } from 'vitest';
import { getErqDenomination, getMapCoordinates } from '../src/lib/scrapers/scripts/erq.js';

/**
 * @param {{ name: string, address: string, website: string, phone: string, contact: string }} church
 */
const churchCard = ({ name, address, website, phone, contact }) => `
	<div class="overflow-hidden shadow-lg">
		<div><div><div class="p-6">
			<h3>${name}</h3>
			<div><img alt="adresse"><a href="https://maps.example/${encodeURIComponent(name)}">${address}</a></div>
			<div><img alt="heure"><p>Sunday 10 h 15</p></div>
			<div><img alt="lien"><a href="${website}">Church website</a></div>
			<div><img alt="celebrations"><a href="https://youtube.example">YouTube</a></div>
			<div><img alt="telephone"><p>${phone}</p></div>
			<div><img alt="email"><p>${contact}</p></div>
		</div></div></div>
	</div>`;

const html = `
	<main>
		${churchCard({
			name: 'Église de Beauce',
			address: '470, 27E rue, Saint-Georges, Quebec G5Y 4J9',
			website: 'https://beauce.erq.qc.ca',
			phone: '418-227-0134',
			contact: 'Pasteur Christian Cruchet - christian.cruchet@erq.qc.ca',
		})}
		${churchCard({
			name: 'Église St-Jean',
			address: '163 Rue de Bellechasse, Montréal, QC H2S 1W3',
			website: 'https://ersj.erq.qc.ca',
			phone: '514-831-3138',
			contact: 'Jean Zoellner (elder) – conseil-pastoral.stjean@erq.qc.ca',
		})}
	</main>`;

describe('getErqDenomination', () => {
	it('extracts ERQ congregation details', () => {
		const result = getErqDenomination(html);

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			name: 'Église de Beauce',
			website: 'https://beauce.erq.qc.ca',
			address: '470, 27E rue, Saint-Georges, Quebec G5Y 4J9',
			addressLabel: '470,<br> 27E rue, Saint-Georges, Quebec G5Y 4J9',
			mapUrl: 'https://maps.example/%C3%89glise%20de%20Beauce',
			pastor: 'Christian Cruchet',
			contact: 'Pasteur Christian Cruchet',
			email: 'christian.cruchet@erq.qc.ca',
			phone: '418-227-0134',
			denominationSlug: 'erq',
			presbyteryId: null,
		});
	});

	it('keeps a non-pastoral contact without treating the contact as pastor', () => {
		const congregation = getErqDenomination(html)[1];

		expect(congregation.contact).toBe('Jean Zoellner (elder)');
		expect(congregation.pastor).toBeNull();
		expect(congregation.email).toBe('conseil-pastoral.stjean@erq.qc.ca');
	});

	it('creates stable unique IDs', () => {
		const firstRun = getErqDenomination(html);
		const secondRun = getErqDenomination(html);
		const ids = firstRun.map(({ id }) => id);

		expect(new Set(ids).size).toBe(ids.length);
		expect(secondRun.map(({ id }) => id)).toEqual(ids);
	});
});

describe('getMapCoordinates', () => {
	it('uses the precise destination coordinates from a Google Maps redirect', async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = async () =>
			new Response(null, {
				status: 302,
				headers: {
					location:
						'https://www.google.com/maps/place/church/@45.7,-73.5,17z/data=!8m2!3d45.7336208!4d-73.4502497',
				},
			});

		try {
			await expect(getMapCoordinates('https://maps.app.goo.gl/example')).resolves.toEqual({
				latitude: 45.7336208,
				longitude: -73.4502497,
			});
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
