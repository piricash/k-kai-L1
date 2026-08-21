# Azure deployment baseline

The Bicep template creates the full Azure hosting boundary: a Free-tier Azure Static Web Apps instance for the React client, a B1 App Service plan, a Linux .NET 10 API site with system-assigned managed identity, and an Azure SQL logical server and Basic database. `location` remains the API and SQL region; `staticWebAppLocation` is separate because Static Web Apps is not available in every Azure region. The API receives the generated Static Web Apps hostname as its initial CORS origin.

Deploy the infrastructure from an authenticated Azure CLI session, providing organisation-specific parameter values without committing them. Run `post-deploy.sql` as the Azure SQL Microsoft Entra administrator afterwards. It creates the runtime API identity with data read/write permissions only. Apply EF Core migrations from a controlled release identity instead of granting runtime schema rights.

The template deliberately does not create firewall relaxations, production secrets, or a Kinde tenant. Keep SQL network access least-privilege and use the Azure Static Web Apps deployment token only as a GitHub Actions repository secret. The complete sequence is in `docs/handoff/azure-only-provider-activation.md`.
