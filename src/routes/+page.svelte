<script>
	import { page } from '$app/state';
	import { Head, StructuredData } from '$lib/components';
	import { websiteSchema } from '$lib/utils/structuredData';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();

	const schema = $derived(websiteSchema(page.url.origin));
</script>

<Head />
<StructuredData data={schema} />

<section class="intro">
	<h1 class="intro-title">Find a confessional church near you</h1>
	<p class="intro-copy">
		Search congregations across the denominations of the North American Presbyterian and Reformed
		Council by city, address, or postal code.
	</p>
</section>

<div class="stats-container">
	<div class="stat-card">
		<div class="stat-number">{data.stats.totalCongregations.toLocaleString()}</div>
		<div class="stat-label">Congregations</div>
	</div>
	<div class="stat-card">
		<div class="stat-number">{data.stats.totalDenominations}</div>
		<div class="stat-label">Denominations</div>
	</div>
	<div class="stat-card">
		<div class="stat-number">{data.stats.totalStates}</div>
		<div class="stat-label">US States & Territories</div>
	</div>
	<div class="stat-card">
		<div class="stat-number">{data.stats.totalProvinces}</div>
		<div class="stat-label">Canadian Provinces</div>
	</div>
</div>

<div class="verse-container">
	<blockquote class="verse">
		<p>
			For a day in thy courts is better than a thousand. I had rather be a doorkeeper in the house
			of my God, than to dwell in the tents of wickedness.
		</p>
		<footer>
			— <a href="https://relight.app/bible/Ps.84.9" target="_blank" rel="noopener noreferrer"
				>Psalm 84:10 (KJV)</a>
		</footer>
	</blockquote>
</div>

<style>
	.intro {
		margin: 0 auto;
		max-width: 34ch;
		padding: var(--space-xl) 0 var(--space-lg);
		text-align: center;
	}

	.intro-title {
		font-size: var(--fs-display);
		font-weight: var(--fw-semibold);
		letter-spacing: -0.025em;
		line-height: 1.1;
		margin: 0 0 var(--space-sm);
	}

	.intro-copy {
		color: var(--secondary);
		margin: 0 auto;
		max-width: 52ch;
	}

	.stats-container {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-xs);
		margin-top: var(--space-lg);
	}

	.stat-card {
		background: var(--bg-ff);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
		justify-content: center;
		padding: var(--space-md) var(--space-sm);
		text-align: center;
		transition:
			transform var(--speed) var(--ease),
			box-shadow var(--speed) var(--ease),
			border-color var(--speed) var(--ease);
	}

	.stat-card:hover {
		border-color: var(--line-strong);
		box-shadow: var(--shadow-sm);
		transform: translateY(-2px);
	}

	.stat-number {
		color: var(--primary);
		font-family: var(--ff-head);
		font-size: clamp(2.6rem, 2rem + 1.8vw, 3.4rem);
		font-variant-numeric: tabular-nums;
		font-weight: var(--fw-semibold);
		letter-spacing: var(--tracking-tight);
		line-height: 1;
	}

	.stat-label {
		color: var(--muted);
		font-size: var(--fs-micro);
		font-weight: var(--fw-semibold);
		letter-spacing: var(--tracking-wide);
		line-height: 1.35;
		text-transform: uppercase;
	}

	.verse-container {
		border-top: 1px solid var(--line);
		margin-top: var(--space-2xl);
		padding-top: var(--space-xl);
		text-align: center;
	}

	.verse {
		color: var(--secondary);
		margin: 0 auto;
		max-width: 46ch;
		position: relative;
	}

	.verse::before {
		content: '\201C';
		color: var(--accent);
		display: block;
		font-family: var(--ff-head);
		font-size: 4.8rem;
		line-height: 0.6;
		margin-bottom: var(--space-xs);
		opacity: 0.45;
	}

	.verse p {
		font-family: var(--ff-head);
		font-size: clamp(1.9rem, 1.6rem + 1vw, 2.4rem);
		font-style: italic;
		font-weight: var(--fw-regular);
		line-height: 1.5;
		margin-bottom: var(--space-sm);
		text-wrap: balance;
	}

	.verse footer {
		color: var(--muted);
		font-size: var(--fs-small);
		font-style: normal;
		font-weight: var(--fw-medium);
		letter-spacing: 0.02em;
	}

	.verse a {
		color: var(--muted);
		text-decoration: underline;
		text-decoration-color: var(--line-strong);
	}

	.verse a:hover,
	.verse a:focus-visible {
		color: var(--accent);
		text-decoration-color: currentColor;
	}

	@media (max-width: 600px) {
		.intro {
			padding: var(--space-lg) 0 var(--space-md);
		}

		.stats-container {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-2xs);
			margin-top: var(--space-md);
		}

		.stat-card {
			padding: var(--space-sm) var(--space-xs);
		}

		.verse-container {
			margin-top: var(--space-xl);
			padding-top: var(--space-lg);
		}
	}
</style>
