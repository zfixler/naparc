<script>
	import { Address, Contact, Email, Header, Phone, Website } from '$lib/components';
	/** @type {{congregation: any}} */
	let { congregation } = $props();
	const address = $derived(congregation.address);
	const addressLabel = $derived(congregation.addressLabel);
	const contact = $derived(congregation.contact);
	const email = $derived(congregation.email);
	const name = $derived(congregation.name);
	const pastor = $derived(congregation.pastor);
	const phone = $derived(congregation.phone);
	const website = $derived(congregation.website);
	const distance = $derived(congregation.distance);
	const denominationSlug = $derived(congregation.denominationSlug);
	const denominationName = $derived(congregation.denominationName);
	const presbyteryName = $derived(congregation.presbyteryName);
	const presbyterySlug = $derived(congregation.presbyterySlug);
	const isContinental = $derived(congregation.isContinental);
	const id = $derived(congregation.id);
</script>

<article class="container">
	<Header
		props={{
			name,
			distance,
			denominationSlug,
			denominationName,
			presbyteryName,
			presbyterySlug,
			isContinental,
			id,
		}} />
	<div class="content">
		<div class="address">
			<Address {address} {addressLabel} {name} />
		</div>
		<div class="contact">
			<Contact {contact} {pastor} />
		</div>
		<div class="email">
			<Email {email} />
		</div>
		<div class="website">
			<Website {website} />
		</div>
		<div class="phone">
			<Phone {phone} />
		</div>
	</div>
</article>

<style>
	.container {
		background-color: var(--bg-ff);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
		padding: var(--space-md);
		margin: var(--space-sm) 0;
		width: 100%;
		transition:
			border-color var(--speed) var(--ease),
			box-shadow var(--speed) var(--ease);
	}

	.container:hover,
	.container:focus-within {
		border-color: var(--line-strong);
		box-shadow: var(--shadow-sm);
	}

	.content {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(250px, 100%), 1fr));
		grid-row-gap: var(--space-xs);
		column-gap: var(--space-lg);
	}

	.address {
		grid-row: 1 / 3;
	}

	.content :global(p),
	.content :global(address) {
		color: var(--secondary);
		font-size: var(--fs-small);
		font-style: normal;
		line-height: var(--lh-snug);
	}

	.content :global(.icon) {
		color: var(--muted);
		height: 18px;
		width: 18px;
	}

	.content :global(.link) {
		align-items: center;
		border-radius: var(--radius-xs);
		gap: var(--space-2xs);
		min-height: 24px;
	}

	.content :global(a.link) {
		color: var(--secondary);
	}

	.content :global(a.link:visited) {
		color: var(--secondary);
	}

	.content :global(a.link:hover),
	.content :global(a.link:focus-visible) {
		color: var(--accent);
	}

	.content :global(a.link:hover .icon),
	.content :global(a.link:focus-visible .icon) {
		color: var(--accent);
	}

	@media (max-width: 480px) {
		.container {
			padding: var(--space-sm);
		}

		.content {
			grid-row-gap: var(--space-2xs);
			margin-top: var(--space-3xs);
		}
	}
</style>
