import { validateEmail, validateMessage, validateName } from '$lib/utils/validation';
import { fail } from '@sveltejs/kit';
import nodemailer from 'nodemailer';

const requestCounts = new Map();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async ({ request, getClientAddress }) => {
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

		const transporter = nodemailer.createTransport({
			service: process.env.MAIL_SERVICE,
			auth: {
				user: process.env.MAIL_USER || '',
				pass: process.env.MAIL_PASS || '',
			},
		});

		const mailOptions = {
			from: {
				name: 'NAPARC Search',
				address: process.env.MAIL_USER || '',
			},
			to: process.env.MAIL_USER,
			subject: 'New Contact Form Submission',
			html: `<h1>New Contact Form Submission</h1>
         <p><strong>Name:</strong> ${sanitized_name}</p>
         <p><strong>Email:</strong> ${sanitized_email}</p>
         <p><strong>Message:</strong></p>
         <p>${sanitized_message}</p>`,
		};

		try {
			const info = await transporter.sendMail(mailOptions);
			console.log('Email sent:', info.response);

			return {
				success: true,
				message: 'Form submitted successfully!',
			};
		} catch (err) {
			console.error('Error sending email:', err);
			return fail(500, { error: 'Failed to send email' });
		}
	},
};
