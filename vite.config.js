import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'$server': '/server',
			'.prisma/client/index-browser': './node_modules/.prisma/client/index-browser.js',
		},
	},
	preview: {
		host: true, // allows 0.0.0.0 binding
		port: Number(process.env.PORT) || 4173,
		allowedHosts: ['naparc.onrender.com'], // allow this Render hostname
	},
});
