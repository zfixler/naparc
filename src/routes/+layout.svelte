<script>
import '@fontsource-variable/outfit';
import '../app.css';
import { Search } from '$lib/features';
import { SchemeToggle } from '$lib/components';
export let data;
</script>

<main class="app">
    <header class="header">
        <h1 class="title"><a href="/">NAPARC Search</a></h1>
        <Search denominations={data.denominations} />
    </header>
    <slot />
    <footer>
        <SchemeToggle />
    </footer>
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

    .title a {
        color: inherit; 
    }
</style>