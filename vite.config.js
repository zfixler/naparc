import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { config } from 'dotenv';

// Explicitly load .env file
config();

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'$server': '/server',
			'.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
		},
	},
});
