<script>
	import { Address, Website, Contact, Phone, Email } from '$lib/components';
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
	} = congregation;
</script>

<article class="container">
	<header class="header">
		<h3 class="title">{name}</h3>
	</header>
	<main class="content">
		<Address
			{address}
			{addressLabel}
			{name}
		/>
		<Contact
			{contact}
			{pastor}
		/>
		<Email {email} />
		<Website {website} />
		<Phone {phone} />
	</main>
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

	.header {
		padding-bottom: var(--padding);
	}

	 .content {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
		grid-row-gap: calc(var(--padding) / 2);
	 }
</style>
