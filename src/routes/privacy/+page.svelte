<script>
	import { Head } from '$lib/components';
</script>

<Head
	title="Privacy | NAPARC Search"
	description="How NAPARC Search handles contact information, preferences, and its optional Ko-fi support form." />

<article class="privacy">
	<header>
		<h1>Privacy</h1>
		<p class="updated">Last updated September 14, 2026</p>
	</header>

	<section>
		<h2>Overview</h2>
		<p>
			NAPARC Search is an independently maintained church directory. It does not sell personal
			information or directly collect payment-card details.
		</p>
	</section>

	<section>
		<h2>Information this site handles</h2>
		<p>
			When you use the contact form, the site receives the name, email address, and message you
			provide. This information is sent through
			<a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer"
				>Resend</a>
			to the maintainer's email account and is used only to respond to your message or act on a reported
			correction.
		</p>
		<p>
			The contact form temporarily uses your IP address in server memory to limit abusive requests.
			The application does not save contact submissions or IP addresses in its database.
		</p>
	</section>

	<section>
		<h2>Cookies</h2>
		<p>
			The site stores a single <code>scheme</code> cookie for up to one year to remember whether you prefer
			its light or dark appearance. It is not used for advertising or cross-site tracking. You can remove
			it through your browser settings.
		</p>
	</section>

	<section>
		<h2>Supporting the project</h2>
		<p>
			The optional floating support button and payment panel are provided by
			<a href="https://ko-fi.com/naparcsearch" target="_blank" rel="noopener noreferrer">Ko-fi</a>.
			Ko-fi's widget script loads with the site. Ko-fi and the payment provider you select may
			process device, cookie, contact, and transaction information under their own policies. NAPARC
			Search does not receive or store your complete payment-card information.
		</p>
		<p>
			Review the
			<a href="https://more.ko-fi.com/privacy" target="_blank" rel="noopener noreferrer"
				>Ko-fi privacy policy</a>
			and the policy of your selected payment provider before submitting a payment. Any tips are voluntary
			and are not represented as tax-deductible charitable contributions.
		</p>
	</section>

	<section>
		<h2>Service providers</h2>
		<p>
			Cloudflare hosts and protects this site and may process ordinary technical request
			information, such as IP addresses, browser details, and request logs, to deliver and secure
			the service. See
			<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer"
				>Cloudflare's privacy policy</a
			>.
		</p>
	</section>

	<section>
		<h2>Retention and your choices</h2>
		<p>
			Contact correspondence is retained only as long as reasonably needed to respond, maintain the
			directory, or meet applicable legal obligations. You can block third-party content through
			your browser settings, and you can ask about or request deletion of contact information by
			using the
			<a href="/contact">contact form</a>.
		</p>
	</section>

	<section>
		<h2>Changes</h2>
		<p>
			This notice may be updated when the site or its service providers change. The date above will
			reflect the latest revision.
		</p>
	</section>
</article>

<style>
	.privacy {
		background-color: var(--bg-ff);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
		margin: 0 auto;
		max-width: 72ch;
		padding: var(--space-lg);
	}

	header {
		border-bottom: 1px solid var(--line);
		margin-bottom: var(--space-lg);
		padding-bottom: var(--space-md);
	}

	h1 {
		margin-bottom: var(--space-2xs);
	}

	.updated {
		color: var(--muted);
		font-size: var(--fs-small);
	}

	section + section {
		margin-top: var(--space-lg);
	}

	h2 {
		font-size: var(--fs-h4);
		margin-bottom: var(--space-2xs);
	}

	p + p {
		margin-top: var(--space-sm);
	}

	a {
		color: var(--accent-strong);
		text-decoration: underline;
	}

	code {
		background-color: var(--bg-subtle);
		border-radius: var(--radius-xs);
		font-size: 0.9em;
		padding: 0.1em 0.35em;
	}

	@media (max-width: 600px) {
		.privacy {
			padding: var(--space-md);
		}
	}
</style>
