import { validateEmail, validateMessage, validateName } from '$lib/utils/validation';
import { fail } from '@sveltejs/kit';

const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async ({ request, getClientAddress, platform }) => {
		const ip = getClientAddress();
		const now = Date.now();

		if (!requestCounts.has(ip)) {
			requestCounts.set(ip, []);
		}

		const timestamps = requestCounts.get(ip);
		const recentTimestamps = timestamps.filter(
			(/** @type {number} */ timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
		);

		recentTimestamps.push(now);
		requestCounts.set(ip, recentTimestamps);

		if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
			return fail(429, { error: 'Too many requests. Please try again later.' });
		}

		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const message = formData.get('message')?.toString();

		const [isValidName, nameError] = validateName(name);
		if (!isValidName) {
			return fail(400, { name, errorMessage: nameError });
		}

		const [isValidEmail, emailError] = validateEmail(email);
		if (!isValidEmail) {
			return fail(400, { email, errorMessage: emailError });
		}

		const [isValidMessage, messageError] = validateMessage(message);
		if (!isValidMessage) {
			return fail(400, { message, errorMessage: messageError });
		}

		/**
		 * Sanitizes a string by replacing `<` and `>` characters with their HTML entity equivalents
		 * and trimming any leading or trailing whitespace.
		 *
		 * @param {string} str - The string to sanitize.
		 * @returns {string} - The sanitized string.
		 */
		const sanitize = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();

		const sanitized_name = sanitize(name || '');
		const sanitized_email = sanitize(email || '');
		const sanitized_message = sanitize(message || '');

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(sanitized_email)) {
			return fail(400, { email, incorrect: true });
		}

		try {
			const resendApiKey = platform?.env.RESEND_API_KEY;
			const contactTo = platform?.env.CONTACT_TO;
			const contactFrom = platform?.env.CONTACT_FROM;
			if (!resendApiKey || !contactTo || !contactFrom) {
				throw new Error('Contact email is not configured');
			}

			const response = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${resendApiKey}`,
					'Content-Type': 'application/json',
					'Idempotency-Key': crypto.randomUUID(),
				},
				body: JSON.stringify({
					from: contactFrom,
					to: [contactTo],
					reply_to: sanitized_email,
					subject: 'New Contact Form Submission',
					text: `Name: ${sanitized_name}\nEmail: ${sanitized_email}\n\n${sanitized_message}`,
					html: `<h1>New Contact Form Submission</h1>
						<p><strong>Name:</strong> ${sanitized_name}</p>
						<p><strong>Email:</strong> ${sanitized_email}</p>
						<p><strong>Message:</strong></p>
						<p>${sanitized_message.replace(/\n/g, '<br>')}</p>`,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Resend returned ${response.status}: ${error}`);
			}
			const result = await response.json();
			console.log(JSON.stringify({ event: 'contact_email_sent', id: result.id }));

			return {
				success: true,
				message: 'Form submitted successfully!',
			};
		} catch (err) {
			console.error(
				JSON.stringify({
					event: 'contact_email_failed',
					error: err instanceof Error ? err.message : String(err),
				}),
			);
			return fail(500, { error: 'Failed to send email' });
		}
	},
};
