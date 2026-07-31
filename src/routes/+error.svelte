<script>
	import { page } from '$app/state';
	import { Head } from '$lib/components';

	const status = $derived(page.status);
	const message = $derived(
		status === 404
			? 'We could not find that page. It may have moved, or the link may be out of date.'
			: (page.error?.message ?? 'Something went wrong on our end. Please try again.'),
	);
</script>

<Head title="NAPARC Search | {status}" />

<section class="container">
	<p class="status">{status}</p>
	<h2 class="title">{status === 404 ? 'Page not found' : 'Something went wrong'}</h2>
	<p class="message">{message}</p>
	<p class="actions">
		<a class="link" href="/">Back to search</a>
		<a class="link" href="/denominations">Browse denominations</a>
	</p>
</section>

<style>
	.container {
		background-color: var(--bg-ff);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
		margin: var(--space-xl) auto;
		max-width: 56ch;
		padding: var(--space-2xl) var(--space-lg);
		text-align: center;
	}

	.status {
		color: var(--muted);
		font-family: var(--ff-head);
		font-size: var(--fs-h2);
		font-variant-numeric: tabular-nums;
		font-weight: var(--fw-semibold);
		letter-spacing: 0.06em;
		line-height: 1;
	}

	.title {
		font-size: var(--fs-h2);
		margin: var(--space-xs) auto var(--space-2xs);
	}

	.message {
		color: var(--secondary);
		font-size: var(--fs-small);
		margin: 0 auto;
		max-width: 44ch;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2xs);
		justify-content: center;
		margin-top: var(--space-lg);
	}

	.link {
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-pill);
		color: var(--secondary);
		font-size: var(--fs-small);
		font-weight: var(--fw-semibold);
		padding: var(--space-2xs) var(--space-md);
		transition:
			background-color var(--speed) var(--ease),
			border-color var(--speed) var(--ease),
			color var(--speed) var(--ease);
	}

	.link:visited {
		color: var(--secondary);
	}

	.link:hover,
	.link:focus-visible {
		background-color: var(--accent-soft);
		border-color: var(--accent-soft);
		color: var(--accent-strong);
	}

	@media (max-width: 600px) {
		.container {
			padding: var(--space-xl) var(--space-md);
		}
	}
</style>
