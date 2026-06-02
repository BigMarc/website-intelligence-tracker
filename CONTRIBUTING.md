# Contributing

Thanks for helping improve Website Intelligence Tracker.

## Development

1. Install Node.js 22 or newer.
2. Copy `.env.example` to `.env`.
3. Add a PostgreSQL `DATABASE_URL`.
4. Run `npm install`.
5. Run `npm run db:migrate:dev`.
6. Run `npm run db:seed`.
7. Run `npm run dev`.

## Public Data And Compliance

Collector changes must preserve the public-data rules:

- Do not log in to Similarweb or any third-party service.
- Do not use private frontend endpoints, paid-only data, hidden values, cookies, proxies, CAPTCHA solving, or rate-limit bypasses.
- Stop and record a blocked status if a public page is unavailable, blocked, login-gated, or protected by CAPTCHA.
- Tests must use sanitized local fixtures rather than live Similarweb requests.

## Pull Requests

- Keep changes focused.
- Add or update tests for parsing, auth, import/export, and scraper behavior.
- Run `npm test` and `npm run build` before opening a pull request.
