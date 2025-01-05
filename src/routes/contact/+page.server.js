import { fail } from '@sveltejs/kit';
import nodemailer from 'nodemailer';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString();
		const email = formData.get('email')?.toString();
		const message = formData.get('message')?.toString();

		if (!name || !email || !message) {
			return fail(400, { name, email, message, missing: true });
		}

		const maxLength = 255;
		if (name.length > maxLength || email.length > maxLength || message.length > maxLength) {
			return fail(400, { name, email, message, tooLong: true });
		}

		/**
		 * Sanitizes a string by replacing `<` and `>` characters with their HTML entity equivalents
		 * and trimming any leading or trailing whitespace.
		 *
		 * @param {string} str - The string to sanitize.
		 * @returns {string} - The sanitized string.
		 */
		const sanitize = (str) => str.replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();

		const sanitized_name = sanitize(name);
		const sanitized_email = sanitize(email);
		const sanitized_message = sanitize(message);

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(sanitized_email)) {
			return fail(400, { email, incorrect: true });
		}

		const transporter = nodemailer.createTransport({
			// @ts-ignore
			host: process.env.MAILTRAP_HOST,
			port: process.env.MAILTRAP_PORT,
			secure: false,
			auth: {
				user: process.env.MAILTRAP_USER,
				pass: process.env.MAILTRAP_PASS,
			},
		});

		const mailOptions = {
			from: {
				name: 'NAPARC Search',
				address: process.env.EMAIL_FROM || '',
			},
			to: process.env.EMAIL_TO,
			subject: 'New Contact Form Submission',
			html: `<h1>New Contact Form Submission</h1>
                   <p><strong>Name:</strong> ${sanitized_name}</p>
                   <p><strong>Email:</strong> ${sanitized_email}</p>
                   <p><strong>Message:</strong></p>
                   <p>${sanitized_message}</p>`,
		};

		// Send the email
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				console.error('Error sending email:', error);
				return fail(500, { error: 'Failed to send email' });
			} else {
				console.log('Email sent:', info.response);
				return { success: true };
			}
		});

		return {
			success: true,
			message: 'Form submitted successfully!',
		};
	},
};
