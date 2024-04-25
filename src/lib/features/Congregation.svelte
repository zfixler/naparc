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
		<div class="content-left">
			<Address
				{address}
				{addressLabel}
				{name}
			/>
			<Website {website} />
		</div>
		<div class="content-right">
			<Contact
				{contact}
				{pastor}
			/>
			<Phone {phone} />
			<Email {email} />
		</div>
	</main>
	<footer class="footer"></footer>
</article>

<style>
	.container {
		background: var(--bg-ff);
		padding: var(--padding);
		margin: var(--margin);
		box-shadow: var(--box-shadow);
		border-radius: var(--brad);
	}

	.header {
		padding-bottom: var(--padding);
	}

	.content {
		display: flex;
	}

	.content-left,
	.content-right {
		width: 50%;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	@media (max-width: 800px) {
		.content {
			flex-direction: column;
		}

		.content-left,
		.content-right {
			width: 100%;
		}

		.content-right {
			margin-top: var(--margin);
		}
	}
</style>
