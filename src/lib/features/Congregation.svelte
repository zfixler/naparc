<script>
    export let congregation;
    const { address, contact, email, name, lat, long, pastor, phone, website } = congregation;
    const uriAddress = encodeURI(address.replace('<br>', ' '));
    const url = `https://www.google.com/maps/search/?api=1&query=${uriAddress}`;
</script>

<article>
    <h3>{name}</h3>
    {#if pastor}
    <p>Pastor: {pastor}</p>
    {:else if contact}
    <p>Contact: {contact}</p>
    {/if}
    {#if address}
    <p>Address: 
        <br>
        <a href={url} target='_blank'>{@html address}</a></p>
    {/if}
    {#if phone}
    <p>Phone: <a href={`tel:+${phone}`}>{phone}</a></p>
    {/if}
    {#if email}
    <p>Email: <a href={`mailto:${email}`}>{email}</a></p>
    {/if}
    {#if website}
    <p>Website: <a href={website} target='_blank'>{website}</a></p>
    {/if}
</article>