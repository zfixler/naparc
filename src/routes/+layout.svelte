<script>
import '@fontsource-variable/outfit';
import '../app.css';
import { Search } from '$lib/features';
import { SchemeToggle } from '$lib/components';
export let data;

const year = new Date().getFullYear();

</script>

<main class="app">
    <header class="header">
        <h1 class="title"><a href="/">NAPARC Search</a></h1>
        <Search denominations={data.denominations} />
    </header>
    <div class="slot">
        <slot />
    </div>
    <footer class="footer">
        <small>&copy; {year}, Zachary Fixler</small>
        <small class="disclaimer">Disclaimer: This website has no official affiliation with NAPARC. All the data contained on this website is publically available online.</small>
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

    .header,
    .slot {
        width: min(800px, 90%);
        margin: 0 auto;
    }

    .app {
        height: 100vh;
		height: 100svh;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-top: 32px;
    }

    .title a {
        color: inherit; 
    }

    .footer {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 16px 32px 8px;
    }
</style>