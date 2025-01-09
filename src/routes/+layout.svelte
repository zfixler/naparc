<script>
	import { SchemeToggle } from '$lib/components';
	import { Search } from '$lib/features';
	import '@fontsource-variable/outfit';
	import '../app.css';
	/** @type {{data: any, children?: import('svelte').Snippet}} */
	let { data, children } = $props();

	const year = new Date().getFullYear();
</script>

<main class="app">
	<header class="header">
		<nav class="nav">
			<ul>
				<li>
					<a href="/denominations">Denominations</a>
				</li>
			</ul>
		</nav>
		<h1 class="title"><a href="/">NAPARC Search</a></h1>
		<Search denominations={data.denominations} />
	</header>
	<div class="slot">
		{@render children?.()}
	</div>
	<footer class="footer">
		<small>&copy; {year}, Zachary Fixler</small>
		<small class="disclaimer"
			>Disclaimer: This website has no official affiliation with NAPARC. All the data contained on
			this website is publically available online.</small>
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

	.app {
		height: 100vh;
		height: 100svh;
		display: grid;
		grid-template-rows: auto 1fr auto;
	}

	.title {
		margin-bottom: 16px;
	}

	.title a {
		color: inherit;
	}

	.footer {
		align-self: end;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: 16px 32px 8px;
	}

	.nav {
		padding-top: 12px;
	}

	.nav ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		justify-content: flex-end;
	}

	.slot {
		align-self: start;
		margin: calc(var(--margin) * 2) auto;
	}

	@media (max-width: 800px) {
		.footer {
			flex-direction: column-reverse;
			align-items: center;
			gap: 16px;
			padding: 16px;
		}
	}
</style>
