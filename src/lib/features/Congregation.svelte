<script>
	import { Address, Contact, Email, Header, Phone, Website } from '$lib/components';
	/** @type {{congregation: any}} */
	let { congregation } = $props();
	const {
		address,
		addressLabel,
		contact,
		email,
		name,
		pastor,
		phone,
		website,
		distance,
		denominationSlug,
		denominationName,
		presbyteryName,
		presbyterySlug,
		isContinental,
	} = congregation;
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
	<footer class="footer"></footer>
</article>

<style>
	.container {
		background-color: var(--bg-ff);
		border-radius: var(--brad);
		box-shadow: var(--box-shadow);
		padding: var(--padding);
		margin: var(--margin) 0;
		width: 100%;
	}

	.content {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(250px, 100%), 1fr));
		grid-row-gap: calc(var(--padding) / 2);
		column-gap: 36px;
	}

	.address {
		grid-row: 1 / 3;
	}

	@media (max-width: 480px) {
		.container {
			padding: calc(var(--padding) * 0.75);
			margin-bottom: calc(var(--margin) * 0.75);
		}

		.content {
			margin-top: 4px;
		}
	}
</style>
