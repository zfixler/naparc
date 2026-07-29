<script>
	import { navigating } from '$app/state';
	import { SchemeToggle } from '$lib/components';
	import { Search } from '$lib/features';
	import '@fontsource-variable/outfit';
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
		margin: 18px 0;
	}

	.header,
	.slot {
		width: min(800px, 90%);
		margin: 0 auto;
	}

	.slot {
		align-self: start;
		margin: var(--margin) auto;
		transition: opacity 0.15s ease;
	}

	/* Stale results stay readable but are clearly not the answer to the pending query */
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
		height: 100svh;
		height: 100vh;
	}

	.title {
		margin-bottom: 16px;
	}

	.title a {
		color: inherit;
	}

	.footer {
		align-items: flex-start;
		align-self: end;
		display: flex;
		justify-content: space-between;
		padding: 16px 32px 8px;
	}

	.nav {
		padding-top: 12px;
	}

	.nav ul {
		display: flex;
		gap: var(--padding);
		justify-content: flex-end;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	@media (max-width: 800px) {
		.footer {
			align-items: center;
			flex-direction: column-reverse;
			gap: 16px;
			padding: 16px;
		}
	}
</style>
