# Kākāriki Kai

Kākāriki Kai is the Priority 1 staff meal-booking test workspace for Kākāriki House. It lets kaimahi review the week and book kai, while a KaiChef can arrange the menu, check daily numbers, print a pickup sheet and review the weekly email.

## Current deployment mode

The first deployment is a **front-end POC**. It stores test state in the browser and includes a clearly labelled test-role switch so the user-facing flows can be exercised. It does not provide shared bookings, genuine SSO, real email delivery or production-grade access control. See [the production runbook](docs/runbooks/poc-to-production.md) for the WMS Azure, Kinde and SendGrid transition.

The live test workspace is available at [k-kai-l1.vercel.app](https://k-kai-l1.vercel.app).

## Local development

```bash
pnpm install
pnpm dev
```

For a release candidate, run:

```bash
pnpm check
pnpm build
```

## Product rules implemented

The menu day owns price, which defaults to $5.00 and displays as `FREE` at zero. Kaimahi can submit weekly bookings with only the offered dietary options. A KaiChef may change a day’s meal after bookings exist. Cancellation remains a manual coordinator process in Priority 1.

## Architecture and release records

The target architecture is recorded in [ADR-001](docs/adr/ADR-001-poc-deployment-profile.md). The implementation scope and ordered validation work are in [the dated requirements document](docs/requirements/2026-08-21_kakariki-kai-mvp_requirements.md).
