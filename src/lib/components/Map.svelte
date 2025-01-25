<script>
	import { onMount } from 'svelte';
	export const ssr = false;

	/** @type {{lat: number,  lon: number, locations: Array<import('@prisma/client').Congregation>}}*/
	const { lat = 41, lon = -80, locations = [] } = $props();

	/**
	 * A mapping of color class names to their hexadecimal color values
	 * @type {Object.<string, string>}
	 */
	const colors = {
		arpc: '#B13D3D',
		canrc: '#d45d3f',
		frcna: '#6a4c93',
		hrc: '#3a6b35',
		opc: '#007b84',
		pca: '#1c4587',
		prc: '#e27d60',
		rcus: '#5c913b',
		rpcna: '#6b2737',
		urcna: '#4d5ab6',
	};

	/**
	 * @type {HTMLDivElement}
	 */
	let mapContainer;

	onMount(async () => {
		const leaflet = await import('leaflet');
		const L = leaflet.default;
		// Initialize map
		const map = L.map(mapContainer).setView([lat, lon], 0);

		const getSvg = (/** @type {string} */ color) =>
			`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="${color}"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>`;

		// Add OpenStreetMap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
		}).addTo(map);

		// Add markers from locations
		locations.forEach((location) => {
			const popup = L.popup({
				content: `<strong><a href="#${location.id}">${location.name} | ${location.denominationSlug.toUpperCase()}</a></strong><br>${location.address}`,
				className: 'popup',
			});

			const svgIcon = L.divIcon({
				html: getSvg(colors[location.denominationSlug]),
				iconSize: [28, 46],
				className: '',
				iconAnchor: [14, 5],
			});

			if (location.lat && location.lon) {
				L.marker([location.lat, location.lon], { icon: svgIcon }).addTo(map).bindPopup(popup);
			}
		});

		// Adjust map to fit all markers
		if (locations.length) {
			const bounds = L.latLngBounds(locations.map((loc) => [loc.lat || 0, loc.lon || 0]));
			map.fitBounds(bounds, { padding: [50, 50] });
		}

		// Create legend
		const legend = new L.Control({ position: 'topright' });

		legend.onAdd = function () {
			const div = L.DomUtil.create('div', 'legend');

			[...new Set(locations.map(({ denominationSlug }) => denominationSlug))].forEach((slug) => {
				div.innerHTML += `
			<div class="legend-item">
				<span class="legend-dot" style="background-color: ${colors[slug]};"></span>
				<span>${slug.toUpperCase()}</span>
			</div>
		`;
			});

			return div;
		};

		legend.addTo(map);
	});
</script>

<div bind:this={mapContainer} class="map"></div>

<style>
	@import 'leaflet/dist/leaflet.css';

	.map {
		border-radius: var(--brad);
		height: 500px;
		margin-bottom: var(--margin);
		width: 100%;
	}

	:global(.popup),
	:global(.legend) {
		font-family: var(--ff-body);
		font-size: calc(var(--fs-regular) * 0.75);
	}

	:global(.legend) {
		background-color: var(--bg-ff);
		border-radius: var(--brad);
		box-shadow: var(--box-shadow);
		padding: calc(var(--padding) / 2);
		margin: calc(var(--margin) / 2) 0;
	}

	:global(.legend-item) {
		display: flex;
		align-items: center;
	}

	:global(.legend-dot) {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		margin-right: 10px;
		display: inline-block;
	}

	@media (max-width: 480px) {
		.map {
			height: 200px;
		}
	}
</style>
