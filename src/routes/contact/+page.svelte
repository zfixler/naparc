<div class="container">
	<h2>Contact Form</h2>
	<form class="contact" method="post">
		<label for="name">
			Name:
			<input type="text" name="name" id="name" required />
		</label>
		<label for="email">
			Email:
			<input type="email" name="email" id="email" required />
		</label>
		<label for="message">
			Message:
			<textarea name="message" id="message" required></textarea>
		</label>
		<button class="submit">Submit</button>
	</form>
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
</style>
