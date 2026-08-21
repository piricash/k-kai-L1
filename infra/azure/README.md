# Azure deployment baseline

The Bicep template creates an Azure App Service plan, a Linux .NET 10 API site with a system-assigned managed identity, an Azure SQL logical server and database, and the non-secret application settings consumed by the API.

Deploy the infrastructure from an authenticated Azure CLI session, providing organisation-specific parameter values without committing them. Run `post-deploy.sql` as the Azure SQL Microsoft Entra administrator afterwards. It creates the runtime API identity with data read/write permissions only. Apply EF Core migrations from a controlled release identity instead of granting runtime schema rights.

The template deliberately does not create firewall relaxations, production secrets, or a Kinde tenant. Restrict Azure SQL networking and configure the exact Vercel origin before live traffic. The full operational sequence is in the production runbook.
