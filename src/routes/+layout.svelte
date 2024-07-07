<script>
import '@fontsource-variable/outfit';
import '../app.css';
import { Search } from '$lib/features';
export let data;
</script>

<main class="app">
    <header class="header">
        <h1 class="title">NAPARC Search</h1>
        <Search denominations={data.denominations} />
    </header>
    <slot />
</main>

<style>
    .header {
		display: flex;
		flex-direction: column;
		gap: 16px;
        margin: 18px 0;
	}

    .app {
        width: min(800px, 90%);
        margin: 0 auto;
    }
</style>