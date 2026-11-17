# Security and local configuration

This is an isolated source edition prepared for review and noncommercial use. It contains no original Git history, production environment files, signing credentials, or production database exports. The private development repositories and deployed applications are separate systems.

## Credentials

- Copy `.env.example` to an ignored local environment file and configure services you control.
- Treat `EXPO_PUBLIC_*`, `NEXT_PUBLIC_*`, Expo `extra`, browser JavaScript and mobile bundles as public. They must never contain provider secret keys, database passwords, service-account private keys or privileged service-role credentials.
- Firebase web configuration, Supabase publishable/anon keys, RevenueCat public SDK keys and Stripe publishable keys are client configuration, not a substitute for authorization. Configure your own projects, restrictions, database rules and row-level security.
- AI and privileged integrations belong behind an authenticated server. The public source must not ask users to embed a private OpenAI, Gemini or payment secret into a client application.
- Do not use the publisher's production systems or credentials. Production integrations are not provisioned by cloning this repository.

## Secret scanning

The prepared snapshot and its new one-commit Git history are scanned with Gitleaks using controlled default rules, an empty ignore file, decoding enabled and no inline suppression. The publication tool repeats these scans immediately before publication and verifies the exact reviewed commit and required file hashes. Pattern-based scanning and review reduce exposure risk; they are not a guarantee that every possible sensitive value has been identified.

Before future pushes, scan both the working tree and Git history. Keep real environment files, private keys, signing files, data exports, dependency directories and local reports out of Git.

If a real credential was ever embedded in another repository or a distributed app, removing it from this source edition does not revoke it. Rotate/revoke it with its provider and update the deployed backend/client as appropriate before enabling production use. Coordinate changes to avoid service interruption.

## Reporting an issue

Send a minimal, redacted report to felipecesarrf@gmail.com. Do not put credentials, customer data, account information or exploit payloads in a public issue.
