# Kākāriki Kai Azure and Kinde vertical-slice release

| Field | Value |
|---|---|
| Release date | 2026-08-21 |
| GitHub revision | `f654ed1` |
| Front-end URL | [k-kai-l1.vercel.app](https://k-kai-l1.vercel.app) |
| Release class | Backend-ready first production vertical slice |
| Production provider state | Awaiting Azure and Kinde environment configuration |

## Delivered

The repository now contains a .NET 10 Clean Architecture solution, Azure SQL EF Core migration, tenant-stamped `Meal`, `MenuDay` and `Booking` aggregates, passwordless App Service-to-Azure SQL infrastructure baseline, Kinde JWT bearer validation, organization-derived tenant resolution, and server-enforced KaiChef permissions. The React application contains Kinde PKCE wiring and a generated Orval API transport, both disabled until their non-secret environment values are configured.

## Verification evidence

The front-end type check, POC test suite and production build passed. The .NET solution compiled in Release configuration and six domain/security tests passed. A local process smoke test confirmed `GET /health` returns `200` and the protected weekly-menu endpoint returns `401` without a bearer token. The public Vercel site loaded after the GitHub push and displayed the expected `SSO setup pending` state while retaining the booking workflow.

## Explicit deployment boundary

The Vercel front-end release is live. No Azure subscription resources or Kinde tenant configuration were available in the current environment, so the Azure API has **not** been deployed and SSO has **not** been activated. The required provider steps, exact variables, migration command and acceptance checks are documented in [the Azure and Kinde setup guide](../runbooks/azure-kinde-setup.md).

## Rollback

If the front-end regression appears, redeploy the preceding Vercel revision. For the future API release, preserve the prior App Service revision, keep schema changes backward compatible throughout the observation period, and do not use destructive database rollback commands.
