<script>
	import { Head } from '$lib/components';
	import { validateEmail, validateMessage, validateName } from '$lib/utils/validation';

	const { form } = $props();

	/** @type {{ [key: string]: { error: string; isValid: boolean; validator: (value: string | undefined) => [boolean, string]; } }} */
	const validation = $state({
		name: {
			error: '',
			isValid: false,
			validator: validateName,
		},
		email: {
			error: '',
			isValid: false,
			validator: validateEmail,
		},
		message: {
			error: '',
			isValid: false,
			validator: validateMessage,
		},
	});

	/**
	 *
	 * @param {Event & { currentTarget: EventTarget & HTMLInputElement | HTMLTextAreaElement; }} e
	 */
	function validateInput(e) {
		const name = e.currentTarget.name;
		if (!name || !validation[name]) return;

		const validator = validation[name].validator;
		const [isValid, error] = validator(e.currentTarget.value);

		validation[name].error = isValid ? '' : error;
		validation[name].isValid = isValid;
	}

	let isValid = $derived(Object.values(validation).every((input) => input.isValid));
</script>

<Head
	title="Contact | NAPARC Search"
	description="Report a missing or out-of-date congregation, or send a question or correction to the maintainer of NAPARC Search." />

<div class="container">
	<h1>Contact Form</h1>
	{#if form?.success}
		<p class="thanks">Thank you, your message has been received!</p>
	{:else}
		<form class="contact" method="post">
			<label for="name" class={[validation.name.error && 'error']}>
				Name:
				<input type="text" name="name" id="name" oninput={validateInput} />
				{#if validation.name.error}
					<p class="error">{validation.name.error}</p>
				{/if}
			</label>
			<label for="email" class={[validation.email.error && 'error']}>
				Email:
				<input type="email" name="email" id="email" oninput={validateInput} />
				{#if validation.email.error}
					<p class="error">{validation.email.error}</p>
				{/if}
			</label>
			<label for="message" class={[validation.message.error && 'error']}>
				Message:
				<textarea name="message" id="message" oninput={validateInput}></textarea>
				{#if validation.message.error}
					<p class="error">{validation.message.error}</p>
				{/if}
			</label>
			<button class="submit" disabled={!isValid}>Submit</button>
		</form>
	{/if}
</div>

<style>
	.container {
		background-color: var(--bg-ff);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-xs);
		margin: 0 auto;
		max-width: 60ch;
		padding: var(--space-lg);
	}

	.container h1 {
		font-size: var(--fs-h3);
		margin-bottom: var(--space-lg);
	}

	.thanks {
		background-color: var(--accent-soft);
		border-radius: var(--radius-sm);
		color: var(--accent-strong);
		padding: var(--space-sm);
	}

	.contact {
		display: flex;
		flex-direction: column;
	}

	.contact label {
		color: var(--secondary);
		display: flex;
		flex-direction: column;
		font-size: var(--fs-small);
		font-weight: var(--fw-semibold);
		letter-spacing: 0.01em;
		margin-bottom: var(--space-md);
	}

	.contact input,
	.contact textarea {
		background-color: var(--bg-ff);
		border-radius: var(--radius-sm);
		border: 1px solid var(--line-strong);
		color: var(--primary);
		font-family: inherit;
		font-size: var(--fs-regular);
		font-weight: var(--fw-regular);
		margin-top: var(--space-2xs);
		outline: none;
		padding: var(--space-xs) var(--space-sm);
		transition:
			border-color var(--speed) var(--ease),
			box-shadow var(--speed) var(--ease);
		width: 100%;
	}

	.contact textarea {
		height: 160px;
		line-height: var(--lh-body);
		resize: vertical;
	}

	.contact input:hover,
	.contact textarea:hover {
		border-color: var(--muted);
	}

	.contact input:focus,
	.contact textarea:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-ring);
	}

	.submit {
		align-self: end;
		background-color: var(--accent);
		border-radius: var(--radius-pill);
		border: none;
		box-shadow: var(--shadow-xs);
		color: var(--on-accent);
		cursor: pointer;
		font-family: inherit;
		font-size: var(--fs-small);
		font-weight: var(--fw-semibold);
		letter-spacing: 0.01em;
		min-height: 44px;
		padding: var(--space-2xs) var(--space-lg);
		transition:
			background-color var(--speed) var(--ease),
			box-shadow var(--speed) var(--ease),
			transform var(--speed) var(--ease);
	}

	.submit:focus-visible,
	.submit:hover:not(:disabled) {
		background-color: var(--accent-strong);
		box-shadow: var(--shadow-sm);
		transform: translateY(-1px);
	}

	.submit:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit:disabled {
		background-color: var(--bg-subtle);
		box-shadow: none;
		color: var(--muted);
		cursor: not-allowed;
		transform: none;
	}

	.error {
		color: var(--danger);
	}

	.error p {
		font-size: var(--fs-small);
		font-weight: var(--fw-regular);
		margin: var(--space-2xs) 0 0;
	}

	.error input,
	.error textarea {
		border-color: var(--danger-soft);
	}

	.error input:focus,
	.error textarea:focus {
		border-color: var(--danger);
		box-shadow: none;
	}

	@media (max-width: 600px) {
		.container {
			padding: var(--space-md);
		}
	}
</style>
