<script>
	import { navigating } from '$app/state';
	import { SchemeToggle } from '$lib/components';
	import { Search } from '$lib/features';
	import '@fontsource-variable/inter';
	import '@fontsource-variable/source-serif-4';
	import '@fontsource-variable/source-serif-4/wght-italic.css';
	import '../app.css';
	/** @type {{data: { denominations: Array<import('./+layout.server.js').DenominationMeta> }, children?: import('svelte').Snippet}} */
	let { data, children } = $props();

	const year = new Date().getFullYear();

	const isNavigating = $derived(Boolean(navigating.to));
</script>

<main class="app">
	{#if isNavigating}
		<div class="progress" aria-hidden="true"></div>
	{/if}
	<div class="visually-hidden" role="status" aria-live="polite">
		{isNavigating ? 'Loading results…' : ''}
	</div>
	<header class="header">
		<nav class="nav">
			<ul>
				<li>
					<a href="/denominations">Denominations</a>
				</li>
				<li>
					<a href="/contact">Contact</a>
				</li>
			</ul>
		</nav>
		<h1 class="title"><a href="/">NAPARC Search</a></h1>
		<Search denominations={data.denominations} />
	</header>
	<div class="slot" class:is-loading={isNavigating} aria-busy={isNavigating}>
		{@render children?.()}
	</div>
	<footer class="footer">
		<small>&copy; {year}, Zachary Fixler</small>
		<small class="disclaimer"
			>Disclaimer: This website has no official affiliation with NAPARC. All the data contained on
			this website is publically available online. Statistics reflect searchable data on this site
			and may not represent all NAPARC congregations.</small>
		<SchemeToggle />
	</footer>
</main>

<style>
	.header {
		padding: var(--space-lg) 0 var(--space-2xs);
	}

	.header,
	.slot {
		width: var(--shell-width);
		margin: 0 auto;
	}

	.slot {
		align-self: start;
		margin: var(--space-lg) auto var(--space-2xl);
		transition: opacity 0.15s ease;
	}

	.slot.is-loading {
		opacity: 0.45;
		pointer-events: none;
	}

	.progress {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		z-index: 2000;
		background-color: var(--bg-bg);
		overflow: hidden;
	}

	.progress::after {
		content: '';
		display: block;
		width: 40%;
		height: 100%;
		background-color: var(--accent);
		animation: indeterminate 1.1s ease-in-out infinite;
	}

	@keyframes indeterminate {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(350%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.progress::after {
			width: 100%;
			animation: none;
		}
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.app {
		display: grid;
		grid-template-rows: auto 1fr auto;
		min-height: 100svh;
	}

	.header {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-areas:
			'title nav'
			'search search';
		align-items: center;
		column-gap: var(--space-md);
		row-gap: var(--space-md);
	}

	.header :global(.form) {
		grid-area: search;
	}

	.title {
		grid-area: title;
		font-size: clamp(2rem, 1.6rem + 1.2vw, 2.6rem);
		font-weight: var(--fw-semibold);
		letter-spacing: var(--tracking-tight);
		margin: 0;
	}

	.title a {
		color: inherit;
		display: inline-block;
	}

	.title a:hover,
	.title a:focus-visible {
		color: var(--accent);
	}

	.nav {
		grid-area: nav;
	}

	.nav ul {
		display: flex;
		gap: var(--space-md);
		justify-content: flex-end;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav a {
		color: var(--muted);
		font-size: var(--fs-small);
		font-weight: var(--fw-medium);
		letter-spacing: 0.01em;
		padding: var(--space-3xs) 0;
		position: relative;
	}

	.nav a::after {
		content: '';
		position: absolute;
		inset: auto 0 0 0;
		height: 1px;
		background-color: currentColor;
		transform: scaleX(0);
		transition: transform var(--speed) var(--ease);
	}

	.nav a:hover,
	.nav a:focus-visible {
		color: var(--accent);
	}

	.nav a:hover::after,
	.nav a:focus-visible::after {
		transform: scaleX(1);
	}

	.footer {
		align-items: center;
		align-self: end;
		border-top: 1px solid var(--line);
		display: flex;
		gap: var(--space-md);
		justify-content: space-between;
		margin: 0 auto;
		padding: var(--space-md) 0 var(--space-lg);
		width: var(--shell-width);
	}

	.footer small {
		color: var(--muted);
		font-size: var(--fs-micro);
		line-height: 1.6;
	}

	.disclaimer {
		max-width: 62ch;
	}

	.footer :global(button) {
		margin-right: -8px;
	}

	@media (max-width: 800px) {
		.header {
			grid-template-columns: 1fr auto;
			padding-top: var(--space-md);
		}

		.footer {
			align-items: flex-start;
			flex-direction: column-reverse;
			gap: var(--space-sm);
			padding: var(--space-md) 0 var(--space-lg);
		}

		.footer :global(button) {
			margin-left: -8px;
			margin-right: 0;
		}
	}
</style>
