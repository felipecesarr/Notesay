# Notesay

A web product for learning languages with video-based lessons and contextual practice.

[Product website](https://www.notesay.online/)

## What this repository shows

- A Next.js/React/TypeScript learning interface.
- Video-based study and contextual practice flows.
- Application data, authentication and optional provider integrations configured for an independent environment.

## Source edition

This is a separately prepared, independently configured source edition dated 17 November 2026. It is not a binary reproduction of the currently published application. It has a new Git history and excludes the private development history and production credentials. The original private repositories and deployments were not changed by this preparation.

Use your own backend and service configuration. Optional integrations may remain disabled until configured; read [SECURITY.md](./SECURITY.md) and the development guide below. No production service access or running demonstration backend is included.

## License and commercial use

The original application code that the licensor is authorized to license is available under **PolyForm Noncommercial License 1.0.0**. Read [LICENSE](./LICENSE), [NOTICE](./NOTICE) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

This is **source-available software**, with use limited to the purposes permitted by that license. Commercial reuse or resale outside those permissions requires a separate license: **felipecesarrf@gmail.com**.

Third-party code, libraries, fonts and assets retain their own licenses and notices. These application terms do not remove rights already granted by their holders. Product names, logos and branding are not offered as a license to market or impersonate the published products. GitHub's platform rights to view and fork public repositories continue to apply.


## Development guide

A web application for English practice built around material the learner chooses.
The source contains YouTube/PDF study, AI conversation, flashcards, quizzes,
reading aloud, interview practice, notes, learning contexts, subscriptions, and
usage tracking. Stack: Next.js 16, React 19, TypeScript, Prisma/PostgreSQL,
Better Auth, Gemini, Stripe, and optional Upstash workflows.

## Source edition

This is a new snapshot without the private Git history, production configuration,
customer database, or internal planning documents. Neutral original PNG placeholders
replace unreviewed onboarding/brand images; the unknown local font uses a system fallback.
Third-party rights remain separate: see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)
and the repository license for the terms covering original application code.

## Local setup

Use Node.js 22 or newer, npm, and a PostgreSQL database you control.

```sh
cp .env.example .env
```

Configure your own `DATABASE_URL`, fresh `BETTER_AUTH_SECRET`, local
`BETTER_AUTH_URL`/`NEXT_PUBLIC_APP_URL`, and Google OAuth credentials before install.
Use the redirect URLs belonging to your own OAuth project.

```sh
npm ci
```

The postinstall hook generates Prisma Client. The exact application schema is
included at `prisma/schema.prisma`; SQL migrations are under `prisma/migrations/`.
After reviewing them, apply migrations only to your own development database:

```sh
npx prisma migrate deploy
npm run dev
```

Open `http://localhost:3000`. To regenerate only the client after a schema change,
run `npx prisma generate`.

Configure the services for the features you want to evaluate:

- AI: server-side `GEMINI_API_KEY`; some existing paths also use
  `GOOGLE_GENERATIVE_AI_API_KEY`.
- Transcripts: your own `SUPADATA_API_KEY` and, where used, `YOUTUBE_API_KEY`.
- Billing: your Stripe **test** account, `STRIPE_SECRET_KEY`,
  `STRIPE_MONTHLY_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET`.
- Background PDF processing: your `QSTASH_TOKEN` and a reachable callback URL.
- Scheduled aggregation: your `CRON_SECRET`.
- Optional support contact: `NEXT_PUBLIC_SUPPORT_EMAIL`.

Private provider keys stay server-side. Never put them in a `NEXT_PUBLIC_*`
variable. The optional admin seed requires `ADMIN_EMAIL` with an address you
control; no production administrator address is included.

## Checks

```sh
npm run lint
npm run build
npm start
```

The preparation checked TypeScript/JavaScript syntax and scanned the sanitized
snapshot for known credential patterns. A full dependency install, typecheck,
production build, database migration, and end-to-end provider flows were **not**
run. Features with missing service configuration are not expected to work.
A secret scan is not a complete production security audit; review authorization,
webhook validation, rate limits, and cost controls before deploying real accounts.

## Code map

- `src/features/`: features, server actions, and React interfaces.
- `src/meetmate/services/`: AI, database, billing, and usage services. The historical
  internal directory name is preserved to keep imports intact.
- `src/app/api/`: routes, callbacks, admin endpoints, and webhooks.
- `prisma/`: schema, SQL migrations, and optional admin seed.
- `public/`: retained SVG branding and neutral source-edition placeholders.
