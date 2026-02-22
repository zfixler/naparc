<script>
	import { Head } from '$lib/components';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<Head />

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
	.stats-container {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 16px;
		margin-top: 32px;
	}

	.stat-card {
		background: var(--bg-ff);
		border-radius: var(--brad);
		padding: 24px 16px;
		text-align: center;
	}

	.stat-number {
		font-size: var(--fs-h1);
		font-weight: 700;
		color: var(--accent);
		line-height: 1;
		margin-bottom: 6px;
	}

	.stat-label {
		font-size: var(--fs-small);
		color: var(--primary);
		opacity: 0.75;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 500;
	}

	.verse-container {
		margin-top: 40px;
		text-align: center;
	}

	.verse {
		font-style: italic;
		color: var(--primary);
		opacity: 0.9;
		max-width: 560px;
		margin: 0 auto;
	}

	.verse p {
		font-size: var(--fs-h5);
		line-height: 1.6;
		margin-bottom: 12px;
	}

	.verse footer {
		font-style: normal;
		font-size: var(--fs-regular);
		opacity: 0.75;
	}

	.verse a {
		color: var(--accent);
		text-decoration: none;
	}

	.verse a:hover {
		text-decoration: underline;
	}

	@media (max-width: 600px) {
		.stats-container {
			grid-template-columns: repeat(2, 1fr);
			gap: 12px;
			margin-top: 24px;
		}

		.stat-card {
			padding: 16px 12px;
		}

		.stat-number {
			font-size: var(--fs-h2);
			margin-bottom: 4px;
		}

		.verse-container {
			margin-top: 28px;
		}

		.verse p {
			font-size: var(--fs-h4);
		}
	}
</style>
