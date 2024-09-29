import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	js.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			'prefer-arrow-callback': 'error',
			'prefer-template': 'error',
			'semi': 'error',
			'quotes': ['error', 'single'],
			'svelte/html-closing-bracket-spacing': 'error',
		},
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/'],
	},
];
