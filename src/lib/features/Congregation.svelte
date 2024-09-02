<script>
	import {
		Address,
		Website,
		Contact,
		Phone,
		Email,
		Header,
	} from '$lib/components';
	export let congregation;
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
		}}
	/>
	<div class="content">
		<div class="address">
			<Address
				{address}
				{addressLabel}
				{name}
			/>
		</div>
		<div class="contact">
			<Contact
				{contact}
				{pastor}
			/>
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
		background: var(--bg-ff);
		padding: var(--padding);
		margin-top: var(--margin);
		box-shadow: var(--box-shadow);
		border-radius: var(--brad);
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
</style>
