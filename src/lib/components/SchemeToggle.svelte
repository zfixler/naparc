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
		display: inline-block;
		width: 48px;
		height: 24px;
		gap: 4px;
		background-color: var(--accent);
		outline: none;
		border: none;
		border-radius: 20px;
		padding: 0;
		position: relative;
		cursor: pointer;
	}

	.light:before,
	.dark:before {
		content: '';
		position: absolute;
		display: inline-block;
		height: 18px;
		width: 18px;
		top: 3px;
		left: 6px;
		background-color: var(--accent);
		border-radius: 100%;
		box-shadow: inset 6px -1px 0px 0px var(--primary);
		transition: all 250ms ease;
	}

	.light:before {
		transform: translate(95%);
		background-color: var(--bg-ff);
		box-shadow: none;
	}
</style>
