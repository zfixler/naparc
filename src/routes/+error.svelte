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
		border-radius: var(--brad);
		box-shadow: var(--box-shadow);
		padding: calc(var(--padding) * 1.5);
		text-align: center;
	}

	.status {
		color: var(--accent);
		font-size: var(--fs-h1);
		font-weight: 700;
		line-height: 1;
	}

	.title {
		margin: 8px auto 12px;
	}

	.message {
		margin: 0 auto;
		max-width: 48ch;
		opacity: 0.85;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		justify-content: center;
		margin-top: var(--margin);
	}

	.link {
		color: var(--accent);
		font-weight: 700;
	}

	.link:hover,
	.link:focus {
		text-decoration: underline;
	}
</style>
