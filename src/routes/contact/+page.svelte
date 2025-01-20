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

<Head title="NAPARC Search | Contact" />

<div class="container">
	<h2>Contact Form</h2>
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
	.container h2 {
		margin-bottom: var(--margin);
	}

	.contact {
		display: flex;
		flex-direction: column;
	}

	.contact label {
		display: flex;
		flex-direction: column;
		font-size: var(--fs-h4);
		margin-bottom: var(--margin);
	}

	.contact input,
	.contact textarea {
		background-color: var(--bg-ff);
		border-radius: var(--brad);
		border: 2px solid var(--bg-ff);
		color: var(--primary);
		font-family: inherit;
		font-size: var(--fs-regular);
		margin-top: calc(var(--margin) / 4);
		outline: none;
		padding: calc(var(--padding) / 2);
		transition: color 0.25s ease;
		width: 100%;
	}

	.contact textarea {
		height: 150px;
	}

	.contact input:focus,
	.contact textarea:focus {
		border-color: var(--accent);
	}

	.submit {
		align-self: end;
		background-color: var(--blue-2);
		border-radius: var(--brad);
		border: none;
		box-shadow: var(--box-shadow);
		color: #fff;
		cursor: pointer;
		font-family: inherit;
		font-weight: bold;
		letter-spacing: 1px;
		padding: 8px 16px;
		transition: background-color ease 0.25s;
	}

	.submit:focus,
	.submit:hover {
		background-color: var(--accent);
	}

	.submit:disabled {
		background-color: var(--gray-3);
	}

	.error {
		color: var(--red-3);
	}

	.error p {
		margin: calc(var(--margin) / 4) 0;
	}

	.error input,
	.error textarea {
		border-color: var(--red-1);
	}

	.error input:focus,
	.error textarea:focus {
		border-color: var(--red-3);
	}
</style>
