# Kākāriki Kai POC-to-production runbook

## Purpose

This runbook converts the deployed front-end test workspace into the intended WMS production service. The POC is safe for workflow validation only. It is not the record of bookings, payments or personnel access.

## Production target

| Capability | Required implementation |
|---|---|
| Authoritative data | Azure SQL with EF Core migrations and tenant-stamped `Meal`, `MenuDay` and `Booking` records. |
| Application core | .NET 10 Domain → Application → Infrastructure → WebAPI projects with FluentValidation, CQRS and an OpenAPI boundary. |
| Identity and access | Kinde SSO with verified issuer, audience, expiry and organisation claims; `KaiChef` mapped to `kaiMenu:manage` and `kaiBookings:view`. |
| Front end | This React client replaces the local adapter with Orval-generated hooks for the OpenAPI contract. |
| Weekly email | Outbox event/command records plus Hangfire, Fluid templates and a SendGrid provider adapter. |
| Printed sheet | A server document port backed by QuestPDF, with browser print retained as a convenience view if desired. |
| Observability | Sentry release and error monitoring plus safe structured logs; never include booking dietary detail or credentials in telemetry. |

## Required manual configuration

| Provider or surface | Manual action | Completion check |
|---|---|---|
| Azure | Provision non-production Azure SQL, a .NET API host, application insights/Sentry configuration, and a least-privilege deployment identity. | A health endpoint responds from staging and a migration rehearsal runs on isolated test data. |
| Kinde | Create development, preview and production applications; configure callback/logout URLs for each deployed domain; add organisation membership and `KaiChef` role claims. | An ordinary kaimahi is denied a chef endpoint and a KaiChef is allowed after server token verification. |
| SendGrid | Verify the sending domain, create an API key scoped to transactional mail, and set the approved staff-group recipient address in server configuration. | A sandbox test is delivered only to the approved list and recorded by the notification adapter. |
| GitHub / deployment | Configure the desired protected branch and environment secrets outside source control. | Required checks complete before a production release. |
| Data release | Create reviewed EF migrations and a one-time import plan if approved test data needs retention. | Counts and ownership checks reconcile before the UI switches from POC storage to API reads. |

## Deployment sequence

Deploy backward-compatible schema first, then the .NET core and API, then the React client using API-backed feature mode. Verify Kinde callback and origin allowlists before sign-in testing. Rehearse the email flow in a non-production recipient list. Observe Sentry and structured logs before allowing the chef workflow for live operations.

## Rollback

For the static POC, roll back to the prior deploy revision. For production, keep the previous API and client release available, preserve backwards-compatible schema during the observation window, and disable email dispatch if delivery health fails. Never roll back a database through ad-hoc destructive SQL; use the recovery plan established during migration rehearsal.
