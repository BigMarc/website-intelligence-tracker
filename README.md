# Website Intelligence Tracker

A Railway-hosted, open-source dashboard for monitoring publicly visible website intelligence over time. It tracks domains, stores historical snapshots, compares estimated external traffic, imports Google Trends CSV data as relative search interest, records scraper runs, and supports optional Telegram summaries.

> The public Similarweb collector stores only information displayed on publicly accessible pages. It does not access authenticated, hidden, restricted, or paid-only Similarweb data. Public-page structure and availability may change. External metrics are estimates and must not be presented as exact measurements.

## Screenshots

Placeholder screenshot slots live in `docs/screenshots/`:

- `overview.png`
- `tracked-websites.png`
- `comparison.png`
- `scrape-runs.png`

## Features

- Password-protected Next.js App Router dashboard.
- PostgreSQL persistence through Prisma.
- Domain management with add, edit, disable, category assignment, warnings, and manual scrape actions.
- Public custom-domain submissions at `/track` that immediately run one Similarweb public scrape without requiring a dashboard login.
- Historical snapshots with previous-snapshot change calculations.
- Public-data Similarweb static HTML collector with robots.txt inspection and access-barrier detection.
- Scrape run logs with per-domain status, duration, warnings, and errors.
- Snapshot CSV import and export.
- Google Trends manual CSV import for relative brand-search interest.
- Configurable alert rules and optional Telegram delivery.
- Railway-ready Dockerfile, `railway.json`, migrations, seed data, and cron command.

## Architecture

```text
Railway Project
├── PostgreSQL Database
├── Web Service
│   ├── npm run start
│   ├── Next.js dashboard and API routes
│   ├── DATABASE_URL from Railway PostgreSQL
│   └── prisma migrate deploy as Railway pre-deploy command
└── Cron Worker Service
    ├── npm run scrape:all
    ├── Same GitHub repository
    ├── Same DATABASE_URL
    ├── Cron schedule: 0 8 * * 0
    └── Exits after the scrape run finishes
```

## Tech Stack

- Node.js 22+
- TypeScript
- Next.js App Router
- PostgreSQL
- Prisma ORM
- Tailwind CSS
- shadcn/ui-style components
- Recharts
- Zod
- Vitest
- Docker
- Railway

## Local Installation

```bash
npm install
cp .env.example .env
npm run db:generate
npm run dev
```

For local database-backed development, set `DATABASE_URL`, then run:

```bash
npm run db:migrate:dev
npm run db:seed
```

Open `http://localhost:3000` and sign in with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

## Environment Variables

```bash
DATABASE_URL=
NEXT_PUBLIC_APP_NAME=Website Intelligence Tracker
APP_BASE_URL=http://localhost:3000
ADMIN_USERNAME=
ADMIN_PASSWORD=
AUTH_SECRET=
REQUEST_DELAY_MS=8000
REQUEST_JITTER_MS=3000
REQUEST_TIMEOUT_MS=30000
MAX_RETRIES=1
SIMILARWEB_PUBLIC_ENABLED=true
SIMILARWEB_API_ENABLED=false
SIMILARWEB_API_KEY=
GOOGLE_TRENDS_MODE=disabled
TELEGRAM_NOTIFICATIONS_ENABLED=false
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Set the same `DATABASE_URL` on the Railway Web Service and the Railway Cron Worker. Set `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `APP_BASE_URL`, request settings, provider settings, and Telegram settings on both services when the cron worker needs to evaluate alerts or send summaries.

## Database Models

The Prisma schema includes:

- `TrackedDomain`
- `DomainCategory`
- `DomainCategoryAssignment`
- `DomainSnapshot`
- `TrafficChannelSnapshot`
- `CountrySnapshot`
- `ScrapeRun`
- `ScrapeRunItem`
- `SearchTerm`
- `SearchInterestSnapshot`
- `AlertRule`
- `AlertEvent`

Snapshots are unique by `trackedDomainId`, `provider`, and `snapshotDate` to prevent accidental duplicate daily snapshots. Manual force runs can replace an existing same-day snapshot.

## Seed Data

```bash
npm run db:seed
```

Seeds categories:

- Creator Monetization Platforms
- Link-in-Bio Platforms
- Social Platforms
- Competitor Agencies
- Other

Seeds domains:

- `onlyfans.com`
- `fansly.com`
- `fanvue.com`
- `linktr.ee`
- `allmylinks.com`
- `beacons.ai`
- `hoo.be`
- `link.me`
- `juicy.bio`
- `bink.bio`
- `instagram.com`
- `tiktok.com`
- `reddit.com`
- `x.com`
- `youtube.com`

## Similarweb Public Collector

The collector uses:

```text
https://www.similarweb.com/website/{domain}/
```

It first inspects `robots.txt`, then performs a normal HTTP request with:

```text
WebsiteIntelligenceTracker/1.0 (+weekly public-data research tool)
```

It parses static public HTML and embedded public structured data. It records `blocked`, `login_wall`, `captcha`, `network_error`, `parser_error`, `no_public_data`, `partial`, or `success` without attempting circumvention.

The collector never:

- Logs in.
- Uses cookies or session tokens.
- Accesses paid-only pages.
- Extracts hidden or blurred values.
- Calls undocumented private frontend endpoints.
- Solves CAPTCHAs.
- Rotates proxies.
- Bypasses rate limits or robots.txt restrictions.

## Public Custom Domain Tracking

Open `/track` to add a custom domain without signing in. The public form:

- Normalizes the submitted URL or domain.
- Creates or re-enables the `TrackedDomain`.
- Assigns unclassified domains to `Other`.
- Immediately runs one Similarweb public scrape with a force refresh for the current snapshot date.
- Leaves the domain active so the Sunday `0 8 * * 0` cron worker includes it in the weekly tracker.

The matching public API route is:

```bash
POST /api/public/track-domain
Content-Type: application/json

{"domain":"example.com"}
```

The response includes the domain, weekly tracker inclusion, scrape run status, latest snapshot status, public metrics when available, warnings, and rate-limit headers. It does not expose dashboard lists, credentials, private HTML, or protected API data.

Public submissions are rate-limited in-process per client IP.

## Google Trends

Google Trends is separate from traffic metrics. Imported values represent relative brand-search interest, not website visits.

Supported modes:

- `GOOGLE_TRENDS_MODE=disabled`
- `GOOGLE_TRENDS_MODE=manual_csv`
- `GOOGLE_TRENDS_MODE=official_alpha_api`

Manual CSV columns:

```csv
term,geo,date,interest
OnlyFans,US,2026-06-02,72
Fansly,US,2026-06-02,18
```

Hidden Google frontend endpoints are not scraped.

## CSV Import And Export

Snapshot CSV import accepts:

```csv
domain,collectedAt,estimatedMonthlyVisits,globalRank,bounceRate,pagesPerVisit,averageVisitDurationSeconds
example.com,2026-06-02,1.2M,#1245,54.22%,3.4,00:03:41
```

Export:

```bash
GET /api/export/snapshots
```

## API Routes

- `GET /api/health`
- `POST /api/public/track-domain`
- `GET /api/domains`
- `POST /api/domains`
- `PATCH /api/domains/:id`
- `POST /api/scrape/domain/:id`
- `POST /api/scrape/all`
- `GET /api/runs`
- `GET /api/runs/:id`
- `POST /api/import/google-trends`
- `POST /api/import/snapshots`
- `GET /api/export/snapshots`

All dashboard pages and protected API routes require a signed secure session cookie. Login attempts are rate-limited in-process.

## Tests

```bash
npm test
```

Coverage includes domain normalization, metric parsing, percentage parsing, duration parsing, rank parsing, missing-data handling, traffic-change calculations, duplicate snapshot prevention, blocked-page detection, login-wall detection, CAPTCHA detection, parser fixtures, authentication protection, and health status formatting.

Automated tests do not depend on live Similarweb requests.

## Production Build

```bash
npm run build
```

Build runs `prisma generate` before `next build`.

## One-Domain Smoke Test

```bash
npm run scrape:domain -- onlyfans.com
```

Without `DATABASE_URL`, this performs a standalone collector run and prints the normalized provider result. With `DATABASE_URL`, it upserts the domain, stores a snapshot, records a scrape run, and evaluates alerts.

Only claim live extraction works when this command returns a `success` or `partial` result with real public metrics.

## Railway Deployment

### 1. Create a public GitHub repository

```bash
git init
git add .
git commit -m "Initial Website Intelligence Tracker"
git branch -M main
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

### 2. Create a Railway project

Create a new Railway project named `website-intelligence-tracker`.

### 3. Add Railway PostgreSQL

Add a PostgreSQL database service. Railway exposes the database connection as:

```text
${{Postgres.DATABASE_URL}}
```

### 4. Create the Web Service

Create a Railway service from the GitHub repository.

Recommended service config:

```text
Build builder: Dockerfile
Start command: npm run start
Pre-deploy command: npm run db:migrate
Healthcheck path: /api/health
```

Set variables on the Web Service:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NEXT_PUBLIC_APP_NAME=Website Intelligence Tracker
APP_BASE_URL=https://<web-service-domain>
ADMIN_USERNAME=<set-a-username>
ADMIN_PASSWORD=<set-a-strong-password>
AUTH_SECRET=<set-a-long-random-secret>
REQUEST_DELAY_MS=8000
REQUEST_JITTER_MS=3000
REQUEST_TIMEOUT_MS=30000
MAX_RETRIES=1
SIMILARWEB_PUBLIC_ENABLED=true
SIMILARWEB_API_ENABLED=false
GOOGLE_TRENDS_MODE=manual_csv
TELEGRAM_NOTIFICATIONS_ENABLED=false
```

After the first deploy, seed once:

```bash
npm run db:seed
```

You can run that through a Railway shell or one-off job with the same `DATABASE_URL`.

### 5. Create the Cron Worker Service

Create a second Railway service from the same GitHub repository.

Recommended service config:

```text
Start command: npm run scrape:all
Cron schedule: 0 8 * * 0
Restart policy: never or on failure with low retry count
```

Set the same variables as the Web Service, especially:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
REQUEST_DELAY_MS=8000
REQUEST_JITTER_MS=3000
REQUEST_TIMEOUT_MS=30000
MAX_RETRIES=1
SIMILARWEB_PUBLIC_ENABLED=true
TELEGRAM_NOTIFICATIONS_ENABLED=false
```

The cron worker exits after `npm run scrape:all` finishes.

### 6. Verify

```bash
curl https://<web-service-domain>/api/health
```

Expected healthy response:

```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

Then open the dashboard URL and sign in.

## Railway Networking Notes

Use Railway variable references so both services connect to the same managed PostgreSQL database:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Prefer the private Railway connection string Railway provides inside the project. Do not commit database credentials to the repository.

## Telegram Alerts

Set:

```bash
TELEGRAM_NOTIFICATIONS_ENABLED=true
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_CHAT_ID=<chat-id>
```

Weekly summaries include tracked domains, success/partial/blocked/failed counts, and review-required domains. Tokens are never logged.

## Official Similarweb API Upgrade Path

`providers/similarweb-api/` is a disabled adapter boundary. To use licensed official API access:

1. Set `SIMILARWEB_API_ENABLED=true`.
2. Set `SIMILARWEB_API_KEY`.
3. Implement the API client inside `providers/similarweb-api/`.
4. Preserve the normalized `ProviderSnapshotResult` contract.
5. Keep public collector compliance rules unchanged.

## Troubleshooting

- `GET /api/health` returns `not_configured`: set `DATABASE_URL`.
- Dashboard redirects to login repeatedly: check `AUTH_SECRET` stability and cookie security on HTTPS.
- Manual scrape returns `blocked`, `login_wall`, or `captcha`: the collector stopped by design.
- Cron worker keeps running: verify its start command is `npm run scrape:all`, not `npm run start`.
- No CSV rows import: verify header names and date formats.
- Duplicate snapshot skipped: same domain, provider, and UTC snapshot date already exists. Use a force run only when intentional.

## Known Limitations

- Static public HTML parsing depends on public page structure and may return `no_public_data` when values are rendered client-side or unavailable.
- Playwright is not enabled by default because the current collector is intentionally static and compliance-first.
- In-process login rate limiting resets when the service restarts.
- Google Trends support is manual CSV by default; no hidden Google endpoints are scraped.
- External metrics are estimates and should not be presented as exact measurements.

## Contributing

See `CONTRIBUTING.md`.

## License

MIT
