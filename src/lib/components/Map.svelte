<script>
	import { onMount } from 'svelte';
	export const ssr = false;

	/** @type {{lat: number,  lon: number, locations: Array<import('../../routes/search/+page.server.js').MapPin>}}*/
	const { lat = 41, lon = -80, locations = [] } = $props();

	/**
	 * Scraped congregation names and addresses go into popup markup, so escape them.
	 * Both are nullable in the schema, hence the coalesce.
	 * @param {string|null|undefined} value
	 */
	const escapeHtml = (value) =>
		String(value ?? '').replace(
			/[&<>"]/g,
			(char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char,
		);

	/**
	 * A pin's card may live on any results page, so link to the page that renders it and
	 * let the hash scroll to the card. Every other search param is preserved.
	 * @param {import('../../routes/search/+page.server.js').MapPin} pin
	 */
	const hrefForPin = (pin) => {
		const params = new URLSearchParams(window.location.search);
		params.set('pg', String(pin.page));
		return `?${params.toString()}#${pin.id}`;
	};

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

		// Add a marker for every congregation in the search, not just the current page
		locations.forEach((location) => {
			const popup = L.popup({
				content: `<strong><a href="${hrefForPin(location)}">${escapeHtml(location.name)} | ${location.denominationSlug.toUpperCase()}</a></strong><br>${escapeHtml(location.address)}`,
				className: 'popup',
			});

			const svgIcon = L.divIcon({
				html: getSvg(colors[location.denominationSlug] ?? '#555'),
				iconSize: [28, 46],
				className: '',
				iconAnchor: [14, 5],
			});

			L.marker([location.lat, location.lon], { icon: svgIcon }).addTo(map).bindPopup(popup);
		});

		// Adjust map to fit all markers
		if (locations.length) {
			const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lon]));
			map.fitBounds(bounds, { padding: [50, 50] });
		}

		// Create legend
		const legend = new L.Control({ position: 'topright' });

		legend.onAdd = function () {
			const div = L.DomUtil.create('div', 'legend');

			// Sorted so the legend order does not depend on which congregation happens to be nearest
			[...new Set(locations.map(({ denominationSlug }) => denominationSlug))]
				.sort()
				.forEach((slug) => {
					div.innerHTML += `
				<div class="legend-item">
					<span class="legend-dot" style="background-color: ${colors[slug] ?? '#555'};"></span>
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
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
		height: 460px;
		margin-bottom: var(--space-lg);
		overflow: hidden;
		width: 100%;
	}

	:global(.popup),
	:global(.legend) {
		font-family: var(--ff-body);
		font-size: var(--fs-micro);
	}

	:global(.leaflet-popup-content-wrapper) {
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-md);
	}

	:global(.legend) {
		background-color: var(--bg-ff);
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		box-shadow: var(--shadow-sm);
		color: var(--secondary);
		font-weight: var(--fw-medium);
		letter-spacing: 0.04em;
		margin: var(--space-xs) !important;
		padding: var(--space-2xs) var(--space-xs);
	}

	:global(.legend-item) {
		display: flex;
		align-items: center;
		line-height: 1.7;
	}

	:global(.legend-dot) {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		margin-right: var(--space-2xs);
		display: inline-block;
		flex-shrink: 0;
	}

	@media (max-width: 480px) {
		.map {
			height: 200px;
		}
	}
</style>
