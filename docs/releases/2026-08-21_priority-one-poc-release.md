# Kākāriki Kai Priority 1 POC release record

| Field | Value |
|---|---|
| Release date | 2026-08-21 |
| GitHub repository | [piricash/k-kai-L1](https://github.com/piricash/k-kai-L1) |
| Tested application commit | `61be562` |
| Live URL | [k-kai-l1.vercel.app](https://k-kai-l1.vercel.app) |
| Deployment | `dpl_EeSJigVUTsP3ofbMVTVn7aL1KJtP` |
| Release class | Front-end functional POC |

## Delivered behavior

The released workspace provides the complete Priority 1 front-end user journey: weekly kai selection, dietary-request selection where offered, saved browser-local bookings, a visible KaiChef role demonstration, meal and menu-day editing, `$5.00` and `FREE` price handling, daily booking totals, alphabetical collection rows, an A4 pickup-sheet view, and a reviewed weekly email simulation.

## Evidence

The focused POC test suite passed three domain rules: free-price formatting, unique per-person/per-day booking upsert, and alphabetical daily booking order. TypeScript validation and the Vite production build completed successfully. Browser evidence in [the smoke-test notes](../validation/browser-smoke-notes.md) covers kaimahi booking, KaiChef access, email review and send simulation, service totals, print-sheet view, responsive rendering, and the corrected live deployment interaction.

## Accepted POC boundaries

The browser-local data store, role switch and email confirmation exist solely for workflow testing. There is no real authentication, shared data, data retention, production permission enforcement, audit trail or outbound email. The release intentionally displays this state to testers rather than presenting it as live operational service.

## Next production gate

Follow [the POC-to-production runbook](../runbooks/poc-to-production.md) to provide Azure SQL, the .NET 10 API core, Kinde claim configuration, and SendGrid. After those are in place, replace the local adapter with generated OpenAPI client hooks and run the tenant, permission, migration, provider and release rehearsals before enabling live operational use.
