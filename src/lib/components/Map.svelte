<script>
	import { onMount } from 'svelte';
	export const ssr = false;
	const { lat = 41, lon = -80, locations = [] } = $props();

	/**
	 * @type {HTMLDivElement}
	 */
	let mapContainer;

	onMount(async () => {
		const leaflet = await import('leaflet');
		const L = leaflet.default;
		// Initialize map
		const map = L.map(mapContainer).setView([lat, lon], 0);
		const svgIcon = L.divIcon({
			html: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#5c6cff"><path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/></svg>',
			iconSize: [28, 46],
			className: '',
			iconAnchor: [14, 5],
		});

		// Add OpenStreetMap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
		}).addTo(map);

		// Add markers from locations
		locations.forEach((location) => {
			const popup = L.popup({
				content: `<strong><a href="#${location.id}">${location.name}</a></strong><br>${location.address}`,
				className: 'popup',
			});
			L.marker([location.lat, location.lon], { icon: svgIcon }).addTo(map).bindPopup(popup);
		});

		// Adjust map to fit all markers
		if (locations.length) {
			const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lon]));
			map.fitBounds(bounds, { padding: [50, 50] });
		}
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

	:global(.popup) {
		font-family: var(--ff-body);
		font-size: calc(var(--fs-regular) * 0.75);
	}

	@media (max-width: 480px) {
		.map {
			height: 200px;
		}
	}
</style>
