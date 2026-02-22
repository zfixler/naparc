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
	.verse-container {
		margin-top: 48px;
		text-align: center;
	}

	.verse {
		font-style: italic;
		color: var(--color-text);
		opacity: 0.9;
		max-width: 600px;
		margin: 0 auto;
	}

	.verse p {
		font-size: 1.375rem;
		line-height: 1.6;
		margin-bottom: 16px;
	}

	.verse footer {
		font-style: normal;
		font-size: 1rem;
		opacity: 0.8;
	}

	.verse a {
		color: var(--color-theme-1);
		text-decoration: none;
	}

	.verse a:hover {
		text-decoration: underline;
	}

	.stats-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 24px;
		margin-top: 48px;
	}

	.stat-card {
		background: var(--color-bg-1);
		border: 1px solid var(--color-theme-1);
		border-radius: 8px;
		padding: 32px 24px;
		text-align: center;
		transition: transform 0.2s ease;
	}

	.stat-card:hover {
		transform: translateY(-4px);
	}

	.stat-number {
		font-size: 3rem;
		font-weight: 700;
		color: var(--color-theme-1);
		line-height: 1;
		margin-bottom: 8px;
	}

	.stat-label {
		font-size: 1rem;
		color: var(--color-text);
		opacity: 0.8;
		text-transform: uppercase;
		letter-spacing: 1px;
		font-weight: 500;
	}

	@media (max-width: 600px) {
		.stats-container {
			gap: 16px;
		}

		.stat-card {
			padding: 24px 16px;
		}

		.stat-number {
			font-size: 2.5rem;
		}

		.stat-label {
			font-size: 0.875rem;
		}
	}
</style>
