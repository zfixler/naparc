/// <reference path="../worker-configuration.d.ts" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface Platform {
			env: Cloudflare.Env;
			context: ExecutionContext;
			caches: CacheStorage;
		}
	}
}

export {};
