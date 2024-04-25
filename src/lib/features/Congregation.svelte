<script>
    import { Address, Website } from '$lib/components';
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
            <p class="contact link">
                <svg xmlns="http://www.w3.org/2000/svg" class="icon" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>
                {#if pastor}
                Pastor {pastor}
                {:else if contact}
                {contact}
                {:else}
                N/A
                {/if}
            </p>
            {#if phone}
            <p class="phone">
                <a href={`tel:+${phone}`} class="link">        
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" class="icon"><path d="M798-120q-125 0-247-54.5T329-329Q229-429 174.5-551T120-798q0-18 12-30t30-12h162q14 0 25 9.5t13 22.5l26 140q2 16-1 27t-11 19l-97 98q20 37 47.5 71.5T387-386q31 31 65 57.5t72 48.5l94-94q9-9 23.5-13.5T670-390l138 28q14 4 23 14.5t9 23.5v162q0 18-12 30t-30 12ZM241-600l66-66-17-94h-89q5 41 14 81t26 79Zm358 358q39 17 79.5 27t81.5 13v-88l-94-19-67 67ZM241-600Zm358 358Z"/></svg>
                    {phone}
                </a>
            </p>
            {/if}
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