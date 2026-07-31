<script>
	import { onMount } from 'svelte';
	let currentScheme = $state('');

	/**
	 * Set current color scheme and cookie
	 * @param {string} scheme
	 */
	function setColorScheme(scheme) {
		const oneYear = 60 * 60 * 24 * 365;
		document.cookie = `scheme=${scheme}; max-age=${oneYear}; path=/`;
		document.documentElement.setAttribute('data-scheme', scheme);
		currentScheme = scheme;
	}

	onMount(() => {
		const savedScheme = document.documentElement.getAttribute('data-scheme');

		if (savedScheme) {
			currentScheme = savedScheme;
			return;
		}

		const prefersDark =
			window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		const scheme = prefersDark ? 'dark' : 'light';
		setColorScheme(scheme);
	});

	function handleToggle() {
		const scheme = currentScheme === 'dark' ? 'light' : 'dark';
		setColorScheme(scheme);
	}
</script>

<button
	role="switch"
	class={currentScheme}
	aria-checked={currentScheme === 'light'}
	aria-label="Toggle color scheme"
	onclick={handleToggle}></button>

<style>
	button {
		align-items: center;
		background: none;
		border: none;
		border-radius: var(--radius-pill);
		color: var(--muted);
		cursor: pointer;
		display: inline-flex;
		flex-shrink: 0;
		height: 40px;
		justify-content: center;
		padding: 0;
		position: relative;
		width: 40px;
		transition:
			background-color var(--speed) var(--ease),
			color var(--speed) var(--ease),
			transform var(--speed) var(--ease);
	}

	button:hover {
		background-color: var(--accent-soft);
		color: var(--accent-strong);
	}

	button:active {
		transform: scale(0.94);
	}

	button::before,
	button::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		background-color: currentColor;
		border-radius: var(--radius-pill);
		transition:
			opacity 220ms var(--ease),
			transform 320ms var(--ease);
	}

	button::before {
		height: 18px;
		width: 18px;
		-webkit-mask-image: radial-gradient(circle 9px at 13px 5px, transparent 99%, #000 100%);
		mask-image: radial-gradient(circle 9px at 13px 5px, transparent 99%, #000 100%);
		opacity: 0;
		transform: translate(-50%, -50%) rotate(35deg) scale(0.5);
	}

	button::after {
		height: 10px;
		width: 10px;
		box-shadow:
			0 -13px 0 -3.5px currentColor,
			0 13px 0 -3.5px currentColor,
			-13px 0 0 -3.5px currentColor,
			13px 0 0 -3.5px currentColor,
			9px 9px 0 -3.5px currentColor,
			-9px 9px 0 -3.5px currentColor,
			9px -9px 0 -3.5px currentColor,
			-9px -9px 0 -3.5px currentColor;
		opacity: 1;
		transform: translate(-50%, -50%) rotate(0) scale(1);
	}

	:global(html[data-scheme='dark']) button::before {
		opacity: 1;
		transform: translate(-50%, -50%) rotate(0) scale(1);
	}

	:global(html[data-scheme='dark']) button::after {
		opacity: 0;
		transform: translate(-50%, -50%) rotate(-35deg) scale(0.5);
	}
</style>
