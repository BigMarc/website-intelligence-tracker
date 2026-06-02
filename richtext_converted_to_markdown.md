Build a Railway-Hosted Open-Source Website Intelligence Tracker
===============================================================

You are a senior full-stack engineer, product designer, data engineer, and Railway deployment specialist.

Build a complete, production-ready, open-source web application named:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Website Intelligence Tracker   `

The app must be deployable from a public GitHub repository to Railway.

It must include:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1. A polished password-protected web dashboard hosted on Railway  2. A PostgreSQL database hosted on Railway  3. A weekly Railway cron worker  4. A public-data Similarweb collector  5. Historical snapshots and change tracking  6. Domain-management screens  7. Scraper logs and error reporting  8. CSV import and export  9. Optional Telegram alerts  10. Clear deployment documentation   `

Do not only create a plan. Implement the full project, run tests, verify the production build, and write the README.

1\. Product Goal
================

I want a hosted dashboard where I can add websites and monitor their publicly visible market-intelligence metrics over time.

Example domains:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   onlyfans.com  fansly.com  fanvue.com  linktr.ee  allmylinks.com  beacons.ai  hoo.be  link.me  juicy.bio  bink.bio  instagram.com  tiktok.com  reddit.com  x.com  youtube.com   `

The dashboard should help answer:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Which websites are growing fastest?  Which websites are losing estimated traffic?  How did a domain change over the last weeks and months?  Which domains have the strongest rankings?  Which publicly visible traffic channels are available?  Which domains have insufficient public data?  Did a scraper run succeed, fail, or become blocked?   `

2\. Required Deployment Architecture
====================================

Use one public GitHub repository and deploy three Railway resources:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Railway Project  ├── PostgreSQL Database  ├── Web Service  │   ├── Always running  │   ├── Hosts the dashboard  │   ├── Connects to Railway PostgreSQL  │   └── Runs database migrations during deployment  └── Cron Worker Service      ├── Uses the same GitHub repository      ├── Connects to the same Railway PostgreSQL database      ├── Runs once per week      ├── Stores domain snapshots      ├── Sends optional Telegram summary      └── Terminates after completion   `

Railway must inject the PostgreSQL connection string through:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   DATABASE_URL   `

The application must use the Railway PostgreSQL database in production.

The weekly Railway cron schedule must run every Sunday at 08:00 UTC:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   0 8 * * 0   `

Use these service commands:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   # Web Service  npm run start  # Cron Worker Service  npm run scrape:all   `

The cron worker must exit after finishing. It must not remain running.

3\. Technology Stack
====================

Use:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Node.js 22+  TypeScript  Next.js with App Router  PostgreSQL  Prisma ORM  Tailwind CSS  shadcn/ui  Recharts  Zod  Vitest  Playwright only if required  Dockerfile  Railway-compatible deployment   `

Use npm unless the repository already uses another package manager.

Keep the architecture lean. Do not add unnecessary services.

4\. Open-Source Repository Requirements
=======================================

Prepare the repository for public GitHub hosting.

Add:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   README.md  LICENSE  CONTRIBUTING.md  .env.example  .gitignore  Dockerfile  railway.json   `

Use an MIT license unless an existing repository license already exists.

Never commit:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   API keys  database credentials  Telegram tokens  cookies  session tokens  private HTML captures  scraped personal data   `

The README must include a one-click-friendly Railway deployment guide and explain how to create:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1. Railway PostgreSQL  2. Railway Web Service  3. Railway Cron Worker Service  4. Shared environment variables  5. Initial Prisma migration  6. Initial seed data   `

5\. Compliance Rules
====================

This is a public-data monitoring tool, not a bypass tool.

Only collect information that is visibly displayed on public pages without authentication.

The application must never:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   - log into Similarweb  - reuse session cookies  - scrape authenticated pages  - access paid-only pages  - extract hidden or blurred values  - call undocumented private frontend endpoints  - reverse-engineer internal Similarweb APIs  - solve CAPTCHAs  - rotate proxies  - use residential proxies  - spoof multiple browser identities  - bypass rate limits  - bypass robots.txt restrictions  - retry aggressively after blocks   `

Before implementing the Similarweb collector:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1. Inspect robots.txt.  2. Check whether the intended public page is accessible.  3. Add a compliance section to the README.  4. Stop immediately if a login wall, CAPTCHA, or access-denied page appears.  5. Record the blocked state in the database.  6. Never attempt circumvention.   `

Use a descriptive user agent:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   WebsiteIntelligenceTracker/1.0 (+weekly public-data research tool)   `

Default request configuration:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   REQUEST_DELAY_MS=8000  REQUEST_JITTER_MS=3000  REQUEST_TIMEOUT_MS=30000  MAX_RETRIES=1   `

6\. Similarweb Public Collector
===============================

Use this public URL pattern:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   https://www.similarweb.com/website/{domain}/   `

First attempt extraction through a normal HTTP request and static HTML parsing.

Only use Playwright if the public values are rendered client-side and static HTML is insufficient.

Playwright rules:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   - use headless Chromium  - do not use stealth plugins  - do not spoof fingerprints  - do not rotate proxies  - do not click login buttons  - do not interact with CAPTCHAs  - block unnecessary images, fonts, and media  - stop on access-denied, CAPTCHA, or login-wall pages   `

Extract only values that are publicly visible.

Attempt to collect:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   estimatedMonthlyVisits  globalRank  countryRank  categoryRank  bounceRate  pagesPerVisit  averageVisitDurationSeconds  trafficChannels  topCountries   `

All fields must support null values.

Do not invent values.

Create robust parsing utilities for:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1,234  1.2K  18.7K  3.4M  2.1B  54.22%  00:03:41  #1,245  N/A   `

Do not treat missing values as zero.

Prefer semantic labels and structured data over fragile CSS selectors.

Store:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   sourceUrl  provider  parserVersion  collectedAt  status  warnings   `

Use explicit statuses:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   success  partial  no_public_data  blocked  login_wall  captcha  parser_error  network_error   `

7\. Provider Abstraction
========================

Create a provider interface so Similarweb can later be replaced or complemented by an official API.

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   export interface WebsiteIntelligenceProvider {    name: string;    collectDomainSnapshot(input: {      domain: string;      collectedAt: Date;    }): Promise;    healthCheck(): Promise;  }   `

Normalized result:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   export type ProviderSnapshotResult = {    status:      | "success"      | "partial"      | "no_public_data"      | "blocked"      | "login_wall"      | "captcha"      | "parser_error"      | "network_error";    sourceUrl: string;    collectedAt: string;    parserVersion: string;    metrics: {      estimatedMonthlyVisits?: number | null;      globalRank?: number | null;      countryRank?: number | null;      categoryRank?: number | null;      bounceRate?: number | null;      pagesPerVisit?: number | null;      averageVisitDurationSeconds?: number | null;    };    trafficChannels?: Array<{      channel:        | "direct"        | "referrals"        | "organic_search"        | "paid_search"        | "social"        | "email"        | "display_ads"        | "other";      sharePercent: number;    }>;    topCountries?: Array<{      countryCode?: string | null;      countryName: string;      sharePercent?: number | null;    }>;    warnings: string[];  };   `

Implement:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   providers/  ├── similarweb-public/  ├── similarweb-api/  ├── manual-csv/  └── google-trends/   `

The similarweb-api provider should remain disabled by default and act as a clean future adapter boundary.

8\. Google Trends Module
========================

Add a separate Google Trends area for relative brand-search interest.

Do not describe Google Trends values as website traffic.

Google Trends should answer:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Is brand search interest rising or falling?  Which brands are gaining momentum?  How does interest compare across countries or timeframes?   `

It does not answer:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   How many website visits a domain receives  Which websites send referral traffic  How many conversions occur   `

Support:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   GOOGLE_TRENDS_MODE=disabled  GOOGLE_TRENDS_MODE=manual_csv  GOOGLE_TRENDS_MODE=official_alpha_api   `

Implement manual CSV import.

Create a documented placeholder for an official API connector.

Do not scrape hidden Google frontend endpoints.

9\. Database Schema
===================

Use Prisma with Railway PostgreSQL.

Create at least these models:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   TrackedDomain  DomainCategory  DomainCategoryAssignment  DomainSnapshot  TrafficChannelSnapshot  CountrySnapshot  ScrapeRun  ScrapeRunItem  SearchTerm  SearchInterestSnapshot  AlertRule  AlertEvent   `

Recommended structure:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   TrackedDomain  - id  - domain  - displayName  - isActive  - notes  - createdAt  - updatedAt  DomainCategory  - id  - name  - slug  - createdAt  DomainSnapshot  - id  - trackedDomainId  - provider  - collectedAt  - sourceUrl  - status  - parserVersion  - estimatedMonthlyVisits  - globalRank  - countryRank  - categoryRank  - bounceRate  - pagesPerVisit  - averageVisitDurationSeconds  - warningsJson  - createdAt  TrafficChannelSnapshot  - id  - domainSnapshotId  - channel  - sharePercent  CountrySnapshot  - id  - domainSnapshotId  - countryCode  - countryName  - sharePercent  ScrapeRun  - id  - startedAt  - finishedAt  - status  - domainsAttempted  - domainsSucceeded  - domainsPartial  - domainsBlocked  - domainsFailed  - createdAt  ScrapeRunItem  - id  - scrapeRunId  - trackedDomainId  - status  - errorMessage  - durationMs  - createdAt   `

Add indexes and uniqueness constraints.

Prevent accidental duplicate snapshots for the same:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   trackedDomainId  provider  snapshot date   `

Allow a force-run override only when explicitly requested.

10\. Dashboard Pages
====================

Build a polished dark-mode-friendly dashboard.

Sidebar:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Overview  Tracked Websites  Categories  Website Comparison  Google Trends  Scrape Runs  Alerts  Settings   `

Overview
--------

Show cards:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Tracked websites  Latest successful snapshots  Domains with partial data  Domains with no public data  Domains requiring review  Latest scraper run   `

Show a sortable table:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Website  Category  Estimated Monthly Visits  Change vs Previous Snapshot  Previous Snapshot  Global Rank  Leading Traffic Channel  Data Status  Last Updated   `

Add traffic-history sparklines.

Tracked Websites
----------------

Allow:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Add domain  Edit domain  Disable domain  Assign category  Trigger manual scrape  View latest snapshot  View warnings   `

Normalize domains:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Strip protocol  Strip paths  Strip query parameters  Lowercase  Remove trailing slash  Reject malformed domains   `

Website Detail Page
-------------------

Show:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Estimated monthly visits over time  Percentage growth  Rank history  Traffic-channel breakdown  Top countries  Scrape-run history  Data source  Warnings  Raw normalized JSON for debugging   `

Comparison Page
---------------

Allow comparison of up to five domains:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Estimated monthly visits  Growth rates  Global ranks  Traffic-channel mix  Google Trends search interest   `

Clearly label:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Estimated external data  Relative search interest  Publicly unavailable   `

Never imply that external estimates are exact.

Scrape Runs
-----------

Show:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Run timestamp  Run duration  Domains attempted  Successful  Partial  Blocked  Failed  Per-domain logs   `

11\. Change Calculations
========================

For every domain calculate:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   latestSnapshot  previousSnapshot  absoluteVisitChange  percentageVisitChange  rankChange  dataFreshness   `

Use:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   percentageVisitChange =    previousValue !== null &&    previousValue !== undefined &&    previousValue > 0 &&    latestValue !== null &&    latestValue !== undefined      ? ((latestValue - previousValue) / previousValue) * 100      : null;   `

Do not show misleading changes when data is missing.

12\. Alerts
===========

Implement configurable alert rules:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Traffic increased by more than X%  Traffic decreased by more than X%  Global rank improved by more than X positions  Global rank declined by more than X positions  No public data for X consecutive runs  Collector blocked  Parser errors detected   `

Add optional Telegram alerts:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   TELEGRAM_NOTIFICATIONS_ENABLED=false  TELEGRAM_BOT_TOKEN=  TELEGRAM_CHAT_ID=   `

Example weekly summary:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Website Intelligence — Weekly Update  Tracked domains: 15  Successful: 12  Partial: 2  Blocked: 0  Failed: 1  Top gainers:  1. example.com: +18.4%  2. example.net: +11.1%  Largest declines:  1. example.org: -9.8%  Review required:  - example.xyz: parser error   `

13\. Admin Authentication
=========================

The hosted Railway dashboard must not be openly accessible.

Implement basic internal authentication using:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   ADMIN_USERNAME=  ADMIN_PASSWORD=  AUTH_SECRET=   `

Protect all dashboard pages and all mutation API routes.

Do not expose credentials in browser bundles.

Add rate limiting for login attempts.

Use secure cookies in production.

14\. Default Seed Data
======================

Seed categories:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Creator Monetization Platforms  Link-in-Bio Platforms  Social Platforms  Competitor Agencies  Other   `

Seed domains:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Creator Monetization Platforms  - onlyfans.com  - fansly.com  - fanvue.com  Link-in-Bio Platforms  - linktr.ee  - allmylinks.com  - beacons.ai  - hoo.be  - link.me  - juicy.bio  - bink.bio  Social Platforms  - instagram.com  - tiktok.com  - reddit.com  - x.com  - youtube.com   `

15\. API Routes
===============

Add:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   GET    /api/health  GET    /api/domains  POST   /api/domains  PATCH  /api/domains/:id  POST   /api/scrape/domain/:id  POST   /api/scrape/all  GET    /api/runs  GET    /api/runs/:id  POST   /api/import/google-trends  POST   /api/import/snapshots  GET    /api/export/snapshots   `

Health endpoint response:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "status": "ok",    "database": "connected",    "timestamp": "..."  }   `

16\. Structured Logging
=======================

Log JSON objects with:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   runId  domain  provider  status  durationMs  attempt  parserVersion  metricsFound  warnings   `

Never log:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Passwords  API keys  Database credentials  Telegram tokens  Session cookies   `

17\. Required Environment Variables
===================================

Create .env.example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   DATABASE_URL=  NEXT_PUBLIC_APP_NAME=Website Intelligence Tracker  APP_BASE_URL=http://localhost:3000  ADMIN_USERNAME=  ADMIN_PASSWORD=  AUTH_SECRET=  REQUEST_DELAY_MS=8000  REQUEST_JITTER_MS=3000  REQUEST_TIMEOUT_MS=30000  MAX_RETRIES=1  SIMILARWEB_PUBLIC_ENABLED=true  SIMILARWEB_API_ENABLED=false  SIMILARWEB_API_KEY=  GOOGLE_TRENDS_MODE=disabled  TELEGRAM_NOTIFICATIONS_ENABLED=false  TELEGRAM_BOT_TOKEN=  TELEGRAM_CHAT_ID=   `

Explain which variables must be added to:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Railway Web Service  Railway Cron Worker   `

Both services must use the same Railway PostgreSQL DATABASE\_URL.

18\. Required Scripts
=====================

Add:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {    "scripts": {      "dev": "next dev",      "build": "prisma generate && next build",      "start": "next start",      "db:generate": "prisma generate",      "db:migrate": "prisma migrate deploy",      "db:migrate:dev": "prisma migrate dev",      "db:seed": "tsx prisma/seed.ts",      "scrape:all": "tsx scripts/scrape-all.ts",      "scrape:domain": "tsx scripts/scrape-domain.ts",      "test": "vitest run",      "test:watch": "vitest"    }  }   `

19\. Railway Deployment Files
=============================

Add:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Dockerfile  railway.json   `

Use a production-ready multi-stage Dockerfile.

Document:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1. Push repository to GitHub.  2. Create a new Railway project.  3. Add PostgreSQL.  4. Create a Railway Web Service from the GitHub repository.  5. Connect DATABASE_URL from Railway PostgreSQL.  6. Add dashboard environment variables.  7. Run prisma migrate deploy.  8. Run seed data once.  9. Create a second Railway service from the same repository.  10. Set its command to npm run scrape:all.  11. Configure cron schedule: 0 8 * * 0.  12. Add the same DATABASE_URL to the cron service.  13. Verify GET /api/health.  14. Open the dashboard URL.   `

Clearly explain how Railway networking and PostgreSQL variables should be configured.

20\. Tests
==========

Write tests for:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Domain normalization  Metric-number parsing  Percentage parsing  Duration parsing  Rank parsing  Missing-data handling  Traffic-change calculations  Duplicate snapshot prevention  Blocked-page detection  Login-wall detection  CAPTCHA detection  Parser fixtures  Authentication protection  Health endpoint   `

Store sanitized static HTML fixtures locally.

Do not depend on live Similarweb requests during automated tests.

Add a manual smoke-test command:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   npm run scrape:domain -- onlyfans.com   `

Only claim live extraction works if the smoke test actually succeeds.

21\. README
===========

Write a complete README containing:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1. Screenshots or placeholder screenshots  2. Product overview  3. Feature overview  4. Architecture diagram  5. Local installation  6. Railway PostgreSQL setup  7. Railway Web Service setup  8. Railway Cron Worker setup  9. Environment variables  10. Database migrations  11. Seeding  12. One-domain smoke test  13. Weekly scraper execution  14. Telegram alerts  15. Google Trends CSV import  16. Official Similarweb API upgrade path  17. Compliance safeguards  18. Troubleshooting  19. Known limitations  20. Contributing  21. License   `

Include this text prominently:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   The public Similarweb collector stores only information displayed on publicly accessible pages. It does not access authenticated, hidden, restricted, or paid-only Similarweb data. Public-page structure and availability may change. External metrics are estimates and must not be presented as exact measurements.   `

22\. Implementation Order
=========================

Execute the work in this order:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1. Inspect the current repository.  2. State whether this is an empty repository or an existing codebase.  3. Create the project structure.  4. Install dependencies.  5. Create the Prisma schema.  6. Generate migrations.  7. Add seed data.  8. Build parsing utilities.  9. Add unit tests.  10. Implement the provider abstraction.  11. Implement the Similarweb public collector.  12. Add scraper orchestration.  13. Add the Railway-compatible cron worker.  14. Build authentication.  15. Build API routes.  16. Build the dashboard.  17. Add CSV imports and exports.  18. Add optional Telegram alerts.  19. Add Dockerfile and Railway configuration.  20. Write the README.  21. Run all tests.  22. Run the production build.  23. Run the local smoke test when network access is available.  24. Fix all detected issues.   `

23\. Final Response Format
==========================

After implementation, provide:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   1. What was built  2. Repository structure  3. Database models  4. Dashboard pages  5. Railway Web Service configuration  6. Railway PostgreSQL configuration  7. Railway Cron Worker configuration  8. Environment variables  9. Similarweb public metrics successfully extracted  10. Metrics unavailable publicly  11. Compliance safeguards  12. Test results  13. Production-build result  14. Local run commands  15. Exact Railway deployment steps  16. Remaining limitations   `

Do not fabricate successful extraction.

Do not claim deployment is complete unless Railway was actually configured.

Do not bypass website access restrictions.