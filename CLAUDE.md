# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NAPARC Search is a SvelteKit application that provides a searchable directory of NAPARC (North American Presbyterian and Reformed Council) affiliated congregations. Users can search by location and denomination.

## Tech Stack

- **Framework**: SvelteKit 2 with Svelte 5
- **Build Tool**: Vite
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Vitest
- **Deployment**: Vercel (configured with maxDuration: 30)
- **Key Dependencies**: Puppeteer (scraping), Cheerio (HTML parsing), Leaflet (maps), Nodemailer (email)

## Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Database
npm run seed             # Seed database with denominations from config/denominations.js
npx prisma studio        # Open Prisma Studio database GUI
npx prisma migrate dev   # Run database migrations
npx prisma generate      # Generate Prisma client (runs automatically on postinstall)

# Code Quality
npm run lint             # Check formatting with Prettier
npm run format           # Format code with Prettier
npm run check            # Run svelte-check for type checking
npm run test             # Run tests with Vitest

# Scrapers
node scripts/run-all-scrapers.js  # Run all denomination scrapers
```

## Architecture

### Database Schema

Hierarchical structure: **Denomination → Presbytery → Congregation**

- **Denomination**: Top-level church organizations (ARPC, PCA, OPC, etc.)
  - Configured in `config/denominations.js` (10 denominations)
  - `continental` field distinguishes Continental Reformed (Three Forms of Unity) from Presbyterian (Westminster Standards)
- **Presbytery**: Regional groupings within denominations
- **Congregation**: Individual churches with location data (lat/lon), contact info, pastor
- **ScrapeLog**: Tracks scraper runs for each denomination (timestamps, status, count)

**Important**: Always use the `getPrisma()` function from `src/lib/prisma.js` to get a Prisma client instance. This ensures proper connection pooling and prevents multiple database connections. The Prisma client uses the `@prisma/adapter-pg` with a cached pg.Pool.

### Directory Structure

- `src/routes/` - SvelteKit routes (filesystem-based routing)
  - `+page.svelte` - Home page
  - `search/` - Search functionality
  - `denominations/` - Denomination listing
  - `[denomination]/congregations/` - Congregations by denomination
  - `[denomination]/[presbytery]/` - Congregations by presbytery
  - `api/geocode/` - Geocoding API endpoint
- `src/lib/components/` - Reusable UI components (Address, Map, Phone, etc.)
- `src/lib/features/` - Business logic components (Congregation, Denomination, Search)
- `src/lib/scrapers/` - Web scrapers for each denomination
  - `scripts/` - Individual scraper implementations (one per denomination)
  - `utils/` - Shared scraping utilities
- `src/hooks.server.js` - SvelteKit server hooks (handles theme scheme via cookies)
- `config/` - Configuration files (denominations.js)
- `scripts/` - Utility scripts (run-all-scrapers.js)
- `prisma/` - Database schema and migrations

### Scrapers

Each denomination has a scraper in `src/lib/scrapers/scripts/` that:

1. Fetches data from the denomination's website using Puppeteer/Cheerio
2. Parses HTML to extract congregation details (name, address, pastor, contact info)
3. Geocodes addresses (using Geoapify API or Nominatim for PRC)
4. Batch upserts congregations to database via shared utilities

**Running Scrapers**:

- Manual: `node scripts/run-all-scrapers.js` (only scrapes denominations not scraped in 48 hours)
- Automated: GitHub Actions workflow runs daily at 2 AM UTC (`.github/workflows/scrape-all.yml`)
- The scraper script updates `ScrapeLog` with timestamps, counts, and error messages

**Supported Denominations**: ARPC, CanRC, FRCNA, HRC, OPC, PCA, PRC, RCUS, RPCNA, URCNA

### Testing

Tests are located in `tests/` directory. Current test coverage includes scrapers for OPC, PCA, and URCNA. Run tests with `npm test` (uses Vitest).

## Environment Variables

Required environment variables (see `.env.example` if available):

- `DATABASE_URL` - PostgreSQL connection string (used by Prisma with pooling)
- `DIRECT_URL` - Direct database connection (for migrations)
- `GEOAPIFY_KEY` - Geoapify geocoding API key
- `MAIL_SERVICE`, `MAIL_USER`, `MAIL_PASS`, `MAIL_ADDRESS` - Nodemailer configuration
- `TURNSTILE_KEY` - Cloudflare Turnstile key
- `MAIL_TO` - Email for Nominatim geocoding API (used by PRC scraper)

## Git Hooks

Husky is configured with:

- Pre-commit: Runs Prettier to format code
- Commit-msg: Validates commit messages using commitlint (conventional commits)

## Deployment

Deployed to Vercel using `@sveltejs/adapter-vercel`. The adapter is configured with `maxDuration: 30` seconds for serverless functions. GitHub Actions workflow handles automated scraping independently.
