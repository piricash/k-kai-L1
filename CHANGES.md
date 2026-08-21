# Changes

## 2026-08-21

### Added

- Established the Kākāriki Kai Priority 1 MVP delivery boundary, WMS target architecture, implementation breakdown and POC-to-production runbook.
- Documented a transparent browser-local POC adapter pending Azure SQL, Kinde and email-provider setup.
- Implemented the deployable Priority 1 front-end workflows for weekly booking, KaiChef meal/menu management, daily service totals, A4 pickup sheets and reviewed email simulation.
- Added focused POC tests, browser smoke-test notes and a GitHub Actions validation workflow for test, type-check and build gates.
- Configured the static Vite output and generated visual assets for the linked Vercel deployment.
- Deployed the corrected MVP to the linked production Vercel project and confirmed a live booking interaction.
- Recorded the deployed URL, tested revision, evidence and explicit POC boundaries in the release record.
- Added the initial .NET 10 Clean Architecture solution, tenant-scoped Azure SQL model, Kinde JWT bearer validation, and server-enforced KaiChef permission boundary.
- Added Azure Bicep and post-deployment SQL artifacts for a secretless App Service to Azure SQL deployment path.
- Added the Kinde PKCE browser adapter, typed bearer-token API client, and configuration-aware sign-in control.
- Added permission and tenant-boundary tests covering KaiChef approval, denial, organization resolution and missing-tenant rejection.
- Verified the API health endpoint is public and the weekly-menu endpoint rejects a request without a bearer token.
- Added Kinde bearer-security metadata to the OpenAPI document and an Orval client-generation contract path.
- Generated the typed React API transport from the server OpenAPI contract and replaced the duplicate hand-maintained menu transport types.
- Extended continuous integration to validate the .NET solution and added the ordered Azure/Kinde activation guide.
- Published the backend-ready front-end revision and recorded the live release boundary, test evidence and rollback posture.
- Replaced the Vercel production-hosting path with Azure Static Web Apps infrastructure, GitHub deployment workflow, static routing policy, and Azure-only activation guide.
- Corrected Azure Static Web Apps provisioning to use a separately configurable supported region while retaining Australia East for the API and Azure SQL database.
- Replaced the fragile Azure SQL external-UPN deployment input with a scripted Entra display-name lookup, added the SQL server managed identity, and set the database location explicitly.
- Added a Tearataea-style `kakariki-kai-git-deploy` service-principal setup and GitHub Actions OIDC infrastructure deployment workflow, eliminating personal Azure deployment access and client secrets.
- Adopted a protected GitHub SQL administrator secret for Azure SQL bootstrap after Azure rejected the federated deployment identity and Entra group as the initial logical-server administrator.
