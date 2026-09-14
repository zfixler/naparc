# NAPARC Search

The goal of this project is to provide a single place for users to search for NAPARC affiliated congregations.

Users can search by location, as well as by denomination.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/zfixler/naparc.git
cd naparc
npm install
```

## Usage

Run the development server:

```bash
npm run db:migrate:local
npm run dev
```

Build the project for production:

```bash
npm run build
```

The deployed application runs as a Cloudflare Worker with a D1 database. Copy
`.dev.vars.example` to `.dev.vars` for local secrets. Production bindings and
routes are configured in `wrangler.jsonc`.

Apply migrations with:

```bash
npm run db:migrate:local
npm run db:migrate:production
```

The daily Puppeteer scrapers remain in GitHub Actions. They write to D1 through
the Cloudflare API and require `CLOUDFLARE_ACCOUNT_ID`,
`CLOUDFLARE_D1_DATABASE_ID`, and `CLOUDFLARE_API_TOKEN` repository secrets.

Preview the production build:

```bash
npm run preview
```

### Support banner

The site loads Ko-fi's floating support widget from `KoFiWidget.svelte`. The widget opens the
NAPARC Search Ko-fi profile without requiring payment credentials in the application.

## Contributing

Contributions are welcome!

## License

This project is licensed under the MIT License.
