# Azure and Kinde environment setup

## Purpose

This guide activates the committed .NET 10 and Kinde integration. Until these steps are complete, the live Vercel site remains intentionally in browser-local **POC mode**. The application code does not accept client-supplied tenant context: it requires a verified Kinde access token with an `org_code` claim, and the API resolves tenant scope from that trusted claim.

## Ordered setup

| Order | Owner action | Expected result |
|---:|---|---|
| 1 | Create a Kinde API and front-end application. | You have the Kinde domain, SPA client ID, API audience, and API permissions. |
| 2 | Create `KaiChef` permissions and organization role assignment. | A member can receive `kaiMenu:manage` and `kaiBookings:view` in their access token. |
| 3 | Deploy `infra/azure/main.bicep` into a non-production Azure resource group. | App Service, system-assigned managed identity, Azure SQL server and database exist. |
| 4 | Run `infra/azure/post-deploy.sql` after replacing the API display-name placeholder. | The managed identity can read and write application data but cannot change schema. |
| 5 | Apply the committed EF migration with a controlled release identity. | The `Meals`, `MenuDays`, and `Bookings` tables exist with tenant-aware indexes. |
| 6 | Configure App Service and Vercel variables. | The API accepts Kinde tokens and the React client displays a live sign-in control. |
| 7 | Smoke-test Kaimahi and KaiChef access independently. | Kaimahi can read the published week; a non-chef receives `403` from the chef daily-service route; KaiChef can read it. |

## Kinde configuration

Create a **front-end/mobile application** using the Kinde SPA flow. Add the exact callback and logout URLs `http://localhost:3000` and `https://k-kai-l1.vercel.app`. Create an API whose audience matches the value set in the API and Vercel configuration. Access tokens must include verified organization context as `org_code` plus a `permissions` claim.

Create the permissions `kaiMenu:manage` and `kaiBookings:view`. Assign both to the organization-scoped `KaiChef` role. The server uses `kaiBookings:view` for `GET /api/v1/chef/daily-service/{serviceDate}`. `kaiMenu:manage` is reserved as the policy for forthcoming write endpoints; the first read-only API slice deliberately exposes no menu write route.

> Do not configure the front end to trust roles without the API. Client checks only improve navigation; the .NET API verifies the Kinde JWT signature, issuer, audience, lifetime, organisation context, and required permission before it reads data. [1] [2]

## Azure deployment

Deploy the Bicep baseline from an authenticated Azure CLI session using a parameter file that is **not** committed. Supply a non-production environment name, App Service name, SQL server name, Microsoft Entra SQL administrator identifiers, Kinde authority and audience, and the exact Vercel origin.

```bash
az deployment group create \
  --resource-group YOUR_RESOURCE_GROUP \
  --template-file infra/azure/main.bicep \
  --parameters @infra/azure/nonprod.parameters.json
```

After deployment, find the App Service system-assigned identity display name or principal, replace `KAKARIKI_KAI_API_NAME` in `infra/azure/post-deploy.sql`, and execute it as the Azure SQL Microsoft Entra administrator. Then apply the migration from a controlled release machine:

```bash
dotnet ef database update \
  --project src/KakarikiKai.Infrastructure/KakarikiKai.Infrastructure.csproj \
  --startup-project src/KakarikiKai.WebAPI/KakarikiKai.WebAPI.csproj
```

The production connection string uses `Authentication=Active Directory Default`, so App Service obtains a token from managed identity instead of storing an SQL password. [3]

## Required application configuration

| Surface | Variable | Value pattern |
|---|---|---|
| Azure App Service | `ConnectionStrings__KakarikiKai` | `Server=tcp:...;Initial Catalog=...;Authentication=Active Directory Default;Encrypt=True;TrustServerCertificate=False;` |
| Azure App Service | `Kinde__Authority` | `https://YOUR_KINDE_SUBDOMAIN.kinde.com` |
| Azure App Service | `Kinde__Audience` | The Kinde API audience exactly as registered. |
| Azure App Service | `Cors__AllowedOrigins__0` | `https://k-kai-l1.vercel.app` |
| Vercel production | `VITE_KINDE_DOMAIN` | `https://YOUR_KINDE_SUBDOMAIN.kinde.com` |
| Vercel production | `VITE_KINDE_CLIENT_ID` | The Kinde SPA application client ID. |
| Vercel production | `VITE_KINDE_API_AUDIENCE` | The Kinde API audience exactly as registered. |
| Vercel production | `VITE_KAKARIKI_API_URL` | The HTTPS Azure App Service API origin, without a trailing slash. |

None of the Vercel variables above is a client secret. Do **not** expose Azure credentials, database passwords, SendGrid keys, or Kinde server-side secrets in a Vite variable.

## Release and rollback checks

Deploy database expansion first, then the API, then Vercel variables and front-end release. Verify `GET /health`, a valid Kaimahi access token against `GET /api/v1/menu/next-week`, a denied ordinary user request against the chef endpoint, and a valid KaiChef request against the same endpoint. Keep the previous Vercel and App Service version available until the observation window completes. Do not remove the POC adapter until an approved data cutover confirms the API is authoritative.

## References

[1] [Kinde: Integrate auth into .NET APIs](https://docs.kinde.com/developer-tools/your-apis/dotnet-based-apis/)

[2] [Kinde: Verifying JSON Web Tokens](https://docs.kinde.com/build/tokens/verifying-json-web-tokens/)

[3] [Microsoft Learn: App Service managed identity and Azure SQL](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-sql-database)
