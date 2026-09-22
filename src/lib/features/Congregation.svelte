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
	const detailCount = $derived(
		Number(Boolean(contact || pastor)) +
			Number(Boolean(email)) +
			Number(Boolean(website)) +
			Number(Boolean(phone)),
	);
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
		{#if contact || pastor}
			<div
				class:align-right={detailCount % 2 === 1 && !email && !website && !phone}
				class="contact">
				<Contact {contact} {pastor} />
			</div>
		{/if}
		{#if email}
			<div class:align-right={detailCount % 2 === 1 && !website && !phone} class="email">
				<Email {email} />
			</div>
		{/if}
		{#if website}
			<div class:align-right={detailCount % 2 === 1 && !phone} class="website">
				<Website {website} />
			</div>
		{/if}
		{#if phone}
			<div class:align-right={detailCount % 2 === 1} class="phone">
				<Phone {phone} />
			</div>
		{/if}
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
		min-width: 0;
		overflow-wrap: anywhere;
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

	.content > div {
		min-width: 0;
	}

	.address {
		grid-row: 1 / 3;
	}

	.align-right {
		grid-column: -2;
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
		min-width: 0;
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
