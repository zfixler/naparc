<script>
	import { onMount } from 'svelte';

	const scriptId = 'kofi-overlay-widget-script';
	const scriptSrc = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';

	onMount(() => {
		let disposed = false;

		function drawWidget() {
			if (disposed) return;

			const widget = Reflect.get(window, 'kofiWidgetOverlay');
			widget?.draw('naparcsearch', {
				'type': 'floating-chat',
				'floating-chat.donateButton.text': 'Support Us',
				'floating-chat.donateButton.background-color': '#323842',
				'floating-chat.donateButton.text-color': '#fff',
			});
		}

		let script = document.getElementById(scriptId);

		if (Reflect.get(window, 'kofiWidgetOverlay')) {
			drawWidget();
		} else if (script) {
			script.addEventListener('load', drawWidget, { once: true });
		} else {
			script = document.createElement('script');
			script.id = scriptId;
			script.src = scriptSrc;
			script.async = true;
			script.addEventListener('load', drawWidget, { once: true });
			document.body.appendChild(script);
		}

		return () => {
			disposed = true;
			script?.removeEventListener('load', drawWidget);
		};
	});
</script>
