# ADR-001: Deploy a functional front-end POC while preserving the WMS production boundary

| Field | Value |
|---|---|
| Status | Accepted for MVP POC |
| Date | 2026-08-21 |
| Owner | Manus AI |
| Review by | Before the first shared-data release |

## Context

Kākāriki Kai needs a testable Priority 1 MVP now, while Azure, Kinde, SQL Server and email-provider access remain to be configured. The supplied WMS standards require a .NET 10 Clean Architecture core with SQL Server as the authoritative home for relational workflows. The immediately deployable web application therefore cannot claim to be the authoritative production service.

## Decision

Use the WMS **Infrastructure-Abstracted Standard** as the target profile. Deploy a React 19 / Vite 7 / TypeScript front-end POC that offers every Priority 1 workflow in browser-local demo storage, including the weekly booking, chef menu, daily list, printable sheet and email review flows. The POC is explicitly labelled as a **test workspace** and uses a role switch only to demonstrate authorised user journeys.

The production replacement path is a .NET 10 domain/application/infrastructure/WebAPI core with EF Core and Azure SQL. It will own `Meal`, `MenuDay`, `Booking` and `RoleAssignment`, map verified Kinde claims to a tenant and role context, publish an OpenAPI contract, and replace the local adapter with generated Orval client hooks. Menu-email dispatch moves into an outbox-backed notification adapter; printable output moves into a QuestPDF document port.

## Consequences

The deployed POC is immediately usable to validate front-end flows and content. It is **not** suitable for shared operational data, real SSO enforcement, real email delivery, audit retention, cross-browser data sharing, or a production chef permission boundary. Those restrictions are visible in the application and documented in the runbook.

The future API is the sole system of record. The POC must not be retained as a dual-write source during production cutover. Any test data requiring preservation should be exported, reviewed, and imported through an explicit one-time process after the authoritative data model is live.

## Rollback trigger and action

If the POC displays misleading production status, exposes test data as shared data, or the intended test audience needs genuine SSO, remove its public deployment and direct testing to the next environment. Revert the deployed commit to restore the prior static version. No persistent shared data migration is involved.
