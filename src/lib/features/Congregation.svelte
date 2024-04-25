<script>
    import { Address, Website, Contact, Phone } from '$lib/components';
    export let congregation;
    const { address, addressLabel, contact, email, name, lat, long, pastor, phone, website } = congregation;
</script>

<article class="container">
    <header class="header">
    <h3 class="title">{name}</h3>
    </header>
    <main class="content">
        <div class="content-left">
            <Address {address} {addressLabel}/>
            <Website {website}/>
        </div>
        <div class="content-right">
            <Contact {contact} {pastor} />
            <Phone {phone} />
            {#if email}
            <p class="email">
                <a href={`mailto:${email}`} class="link">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" class="icon" width="24"><path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/></svg>
                    {email}
                </a>
            </p>
            {/if}
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

    .link {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .icon {
        fill: currentColor;
    }

</style>