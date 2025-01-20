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
		const map = L.map(mapContainer).setView([lat, lon], 13);

		// Add OpenStreetMap tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© OpenStreetMap contributors',
		}).addTo(map);

		// Add markers from locations
		locations.forEach((location) => {
			L.marker([location.lat, location.lon])
				.addTo(map)
				.bindPopup(`<strong>${location.name}</strong><br>${location.address}`);
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

	@media (max-width: 480px) {
		.map {
			height: 200px;
		}
	}
</style>
