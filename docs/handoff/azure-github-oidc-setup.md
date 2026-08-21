# Kākāriki Kai — dedicated GitHub deployment identity

## Delivery model

Kākāriki Kai follows the Tearataea model: a dedicated service principal named **`kakariki-kai-git-deploy`** receives **Contributor** only on `rg-kakariki-kai-prod-aue`. GitHub Actions authenticates as that principal through a federated OpenID Connect trust; it uses no client secret and does not use Piri Cash’s identity. OIDC requires the workflow `id-token: write` permission and an Azure federated identity credential that narrowly matches the GitHub repository and `production` environment. [1] [2]

| Identity | Scope | Purpose |
|---|---|---|
| `kakariki-kai-git-deploy` service principal | Contributor on `rg-kakariki-kai-prod-aue` only | Creates and updates Azure Static Web Apps, App Service and Azure SQL infrastructure from GitHub Actions. |
| App Service system-assigned managed identity | Azure SQL database roles only | Runtime passwordless connection from the .NET API to Azure SQL. |
| Azure SQL server system-assigned identity | Microsoft Graph lookup permission or approved Directory Readers group | Resolves Entra identities during `CREATE USER ... FROM EXTERNAL PROVIDER`. [3] |

## One-time administrator action

An Azure administrator with permission to create Entra applications and resource-group role assignments should run this from Azure Cloud Shell:

```bash
git clone https://github.com/piricash/k-kai-L1.git
cd k-kai-L1
git pull origin main
bash infra/azure/create-github-oidc-deployer.sh
```

The script is idempotent. It creates or reuses `kakariki-kai-git-deploy`, creates its service principal, assigns Contributor **only** on the Kākāriki Kai resource group, and creates an OIDC trust restricted to:

```text
repo:piricash/k-kai-L1:environment:production
```

## GitHub configuration

Add the three values printed by the script as **GitHub Actions secrets** in `piricash/k-kai-L1`. Also add the following **Actions variables**:

| Variable | Value |
|---|---|
| `AZURE_RESOURCE_GROUP` | `rg-kakariki-kai-prod-aue` |
| `AZURE_LOCATION` | `australiaeast` |
| `AZURE_STATIC_WEB_APP_LOCATION` | `eastasia` |
| `AZURE_API_SITE_NAME` | `kakariki-kai-api-6e848e` |
| `AZURE_SQL_SERVER_NAME` | `kkai-sql-6e848e` |
| `AZURE_STATIC_WEB_APP_NAME` | `kakariki-kai-web-6e848e` |
| `AZURE_SQL_DATABASE_NAME` | `kakariki-kai` |
| `AZURE_SQL_ENTRA_ADMIN_OBJECT_ID` | The approved Azure SQL administrator’s Entra object ID |
| `AZURE_SQL_ENTRA_ADMIN_DISPLAY_NAME` | The approved Azure SQL administrator’s exact Entra display name |
| `KINDE_AUTHORITY` | `https://auth.tearataea.co.nz` |
| `KINDE_API_AUDIENCE` | `https://api.kakariki-kai` |

Once these are present, run **Actions → Deploy Kākāriki Kai Azure infrastructure → Run workflow**. The workflow authenticates through OIDC and prints the Azure output values without needing your personal Azure sign-in.

## References

[1] [Microsoft Learn: Azure Login with OpenID Connect](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure-openid-connect)

[2] [GitHub Docs: configuring OpenID Connect in Azure](https://docs.github.com/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure)

[3] [Microsoft Learn: service principals and managed identities with Azure SQL](https://learn.microsoft.com/en-us/azure/azure-sql/database/authentication-aad-service-principal?view=azuresql)
