<script>
	/** @type {HTMLDialogElement | undefined} */
	let dialog;
	let loaded = $state(false);

	function openDialog() {
		loaded = true;
		dialog?.showModal();
	}

	function closeDialog() {
		dialog?.close();
	}

	/** @param {MouseEvent} event */
	function closeFromBackdrop(event) {
		if (event.target === event.currentTarget) closeDialog();
	}
</script>

<button class="trigger" type="button" onclick={openDialog}>Support me</button>

<dialog bind:this={dialog} aria-label="Support NAPARC Search" onclick={closeFromBackdrop}>
	<button class="close" type="button" aria-label="Close support panel" onclick={closeDialog}
		>&times;</button>
	{#if loaded}
		<iframe
			src="https://ko-fi.com/naparcsearch/?hidefeed=true&widget=true&embed=true&preview=true"
			height="570"
			referrerpolicy="strict-origin-when-cross-origin"
			title="Support NAPARC Search on Ko-fi"></iframe>
	{/if}
	<p class="fallback">
		Having trouble with the form?
		<a href="https://ko-fi.com/Z3I3270IJK" target="_blank" rel="noopener noreferrer"
			>Open Ko-fi in a new tab</a
		>.
	</p>
</dialog>

<style>
	.trigger {
		background-color: #000000;
		border: 1px solid #000000;
		border-radius: var(--radius-xs);
		color: #ffffff;
		cursor: pointer;
		font-family: inherit;
		font-size: var(--fs-small);
		font-weight: var(--fw-semibold);
		line-height: 1;
		padding: var(--space-xs) var(--space-sm);
		white-space: nowrap;
	}

	.trigger:hover,
	.trigger:focus-visible {
		background-color: var(--primary);
		border-color: var(--primary);
		color: var(--bg-bg);
	}

	dialog {
		background: #f9f9f9;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		color: #14202b;
		inset: 0;
		margin: auto;
		max-height: calc(100svh - 32px);
		max-width: calc(100% - 32px);
		overflow: auto;
		padding: var(--space-xs) var(--space-xs) var(--space-sm);
		position: relative;
		width: 520px;
	}

	dialog::backdrop {
		background-color: rgba(8, 15, 21, 0.72);
		backdrop-filter: blur(3px);
	}

	.close {
		align-items: center;
		background: transparent;
		border: 0;
		border-radius: var(--radius-pill);
		color: #43566a;
		cursor: pointer;
		display: inline-flex;
		font-family: inherit;
		font-size: 2.6rem;
		height: 40px;
		justify-content: center;
		line-height: 1;
		position: absolute;
		right: var(--space-sm);
		top: var(--space-sm);
		width: 40px;
		z-index: 2;
	}

	.close:hover,
	.close:focus-visible {
		background: #e4e9ed;
		color: #14202b;
	}

	iframe {
		background: #f9f9f9;
		border: 0;
		display: block;
		width: 100%;
	}

	.fallback {
		color: #43566a;
		font-size: var(--fs-micro);
		margin-top: var(--space-2xs);
		text-align: center;
	}

	.fallback a {
		color: #094f4b;
		text-decoration: underline;
	}
</style>
