/**
 * Validates an email address.
 *
 * @param {string|undefined} email - The email address to validate.
 * @returns {[boolean, string]} An array where the first element is a boolean indicating if the email is valid,
 * and the second element is a string message describing the validation result.
 */
export function validateEmail(email) {
	/** @type {[boolean, string]} */
	const valid = [false, ''];

	if (!email) {
		valid[1] = 'Email missing.';
		return valid;
	}

	if (email.length < 6) {
		valid[1] = 'Email too short.';
		return valid;
	}

	if (email.length > 32) {
		valid[1] = 'Email too long.';
		return valid;
	}

	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!re.test(String(email).toLowerCase())) {
		valid[1] = 'Email does not match format.';
		return valid;
	}

	valid[0] = true;
	valid[1] = 'Email is valid.';

	return valid;
}

/**
 * Validates a name.
 *
 * @param {string|undefined} name - The name to validate.
 * @returns {[boolean, string]} An array where the first element is a boolean indicating if the name is valid,
 * and the second element is a string message describing the validation result.
 */
export function validateName(name) {
	/** @type {[boolean, string]} */
	const valid = [false, ''];

	if (!name) {
		valid[1] = 'Name missing.';
		return valid;
	}

	if (name.length < 2) {
		valid[1] = 'Name too short.';
		return valid;
	}

	if (name.length > 50) {
		valid[1] = 'Name too long.';
		return valid;
	}

	const re = /^[a-zA-Z\s'-]+$/;
	if (!re.test(String(name))) {
		valid[1] = 'Name contains invalid characters.';
		return valid;
	}

	valid[0] = true;
	valid[1] = 'Name is valid.';

	return valid;
}

/**
 * Validates a message.
 *
 * @param {string|undefined} message - The message to validate.
 * @returns {[boolean, string]} An array where the first element is a boolean indicating if the message is valid,
 * and the second element is a string message describing the validation result.
 */
export function validateMessage(message) {
	/** @type {[boolean, string]} */
	const valid = [false, ''];

	if (!message) {
		valid[1] = 'Message missing.';
		return valid;
	}

	if (message.length < 10) {
		valid[1] = 'Message too short.';
		return valid;
	}

	if (message.length > 500) {
		valid[1] = 'Message too long.';
		return valid;
	}

	valid[0] = true;
	valid[1] = 'Message is valid.';

	return valid;
}
