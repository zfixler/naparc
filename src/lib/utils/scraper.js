/**
 * Extracts the pastor's name from the provided text.
 * @param {string|null} text - The input text to extract the pastor's name from.
 * @returns {string|undefined} The pastor's name or undefined if not found.
 */
export function getPastorName(text) {
    if (!text) return;
    const regex = /Pastor:\s*([A-Z][a-zA-Z. ]+)/;
    const match = text.match(regex);
    if (match) {
        return match[1];
    }
}

/**
 * Extracts the contact name from the provided text.
 * @param {string|null} text - The input text to extract the contact name from.
 * @returns {string|undefined} The contact name or undefined if not found.
 */
export function getContactName(text) {
    if (!text) return;
    const regex = /Contact:\s*([A-Z][a-zA-Z. ]+)/;
    const match = text.match(regex);
    if (match) {
        return match[1];
    }
}

/**
 * Extracts the contact email address from the provided text.
 * @param {string|null} text - The input text to extract the contact email address from.
 * @returns {string|undefined} The contact email address or undefined if not found.
 */
export function getContactEmailAddress(text) {
    if (!text) return;
    const emailRegex = /(?:mailto:)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const matches = text.match(emailRegex);
    if (matches) {
        return matches[1];
    }
}


/**
 * Extracts the contact phone number from the provided text.
 * @param {string|null} text - The input text to extract the contact phone number from.
 * @returns {string|undefined} The contact phone number or undefined if not found.
 */
export function getContactPhoneNumber(text) {
    if (!text) return;
    const phoneRegex = /\b(\d{3}-\d{3}-\d{4})\b/;
    const matches = text.match(phoneRegex);
    if (matches) {
        return matches[1];
    }
}

/**
 * Extracts the website URL from the provided text.
 * @param {string|null} text - The input text to extract the website URL from.
 * @returns {string|undefined} The website URL or undefined if not found.
 */
export function getWebsiteUrl(text) {
    if (!text) return;
    const websiteRegex = /Website:\s*<a\s.*?href="([^"]+)"/;
    const matches = text.match(websiteRegex);
    if (matches) {
        return matches[1];
    }
}
