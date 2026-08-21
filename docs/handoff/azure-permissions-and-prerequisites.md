# Kākāriki Kai — Azure permissions and prerequisites

> **Confirmed state:** `rg-kakariki-kai-prod-aue` already exists in **Australia East**. Do not run `az group create` again. Update the already-cloned repository before retrying because the current template separates the Static Web Apps region from the API and database region.

## Minimum access required

| Scope | Minimum role or permission | Why it is required |
|---|---|---|
| `rg-kakariki-kai-prod-aue` | **Contributor** | Deploy the Bicep template, which creates the App Service plan/site, Static Web App, SQL logical server/database, app settings and identities. Azure SQL Bicep deployment accepts Contributor, SQL DB Contributor or SQL Server Contributor; Contributor is simplest because this deployment creates multiple non-SQL resources. [1] |
| Azure subscription | Ability to register `Microsoft.Web` and `Microsoft.Sql` resource providers | Needed only if they have not already been registered. A subscription Owner or Contributor can normally do this; an organisation may restrict it to a platform administrator. |
| Microsoft Entra tenant | Permission to configure the selected Microsoft Entra user as the Azure SQL server administrator | The template sets the SQL server’s Entra administrator. The nominated user must be an actual user/guest in this tenant—not merely a personal Microsoft account absent from the directory. [2] |
| Azure SQL database | Microsoft Entra SQL administrator | Required to execute `CREATE USER ... FROM EXTERNAL PROVIDER` and add the App Service managed identity to `db_datareader` and `db_datawriter`. [2] |
| GitHub repository `piricash/k-kai-L1` | **Repository admin** or permission to manage Actions secrets | Required to store the Azure Static Web Apps deployment token and four Vite build-time values. |

No database password, service principal secret, or Azure client secret is needed for the deployed API. The App Service uses its system-assigned managed identity with `Authentication=Active Directory Default`. [2]

## Exact Azure values already known

| Field | Value or action |
|---|---|
| Existing resource group | `rg-kakariki-kai-prod-aue` |
| API and SQL location | `australiaeast` |
| Static Web Apps location | `eastasia` — Azure Static Web Apps is not available in Australia East. |
| Microsoft Entra tenant ID | Reuse the tenant ID printed by your successful `az account show` command. |
| Microsoft Entra administrator object ID | Reuse the object ID printed by your successful `az ad signed-in-user show --query id -o tsv` command. |
| Microsoft Entra administrator login | Use the exact UPN printed by `az account show --query user.name -o tsv`. |

## One-time subscription checks

Run these from Azure Cloud Shell. If either registration command is denied, ask the subscription administrator to register the provider; no other elevated Azure RBAC role is required for this step.

```bash
az provider register --namespace Microsoft.Web
az provider register --namespace Microsoft.Sql

az provider show --namespace Microsoft.Web --query registrationState -o tsv
az provider show --namespace Microsoft.Sql --query registrationState -o tsv
```

Both final lines must print `Registered`.

## Corrected deployment retry

First update your existing clone, then use names that are globally unique. The suggested suffix comes from the subscription ID you already displayed.

```bash
cd ~/k-kai-L1
git pull origin main

export RG=rg-kakariki-kai-prod-aue
export LOCATION=australiaeast
export STATIC_WEB_APP_LOCATION=eastasia
export API_SITE_NAME=kakariki-kai-api-6e848e
export SQL_SERVER_NAME=kkai-sql-6e848e
export STATIC_WEB_APP_NAME=kakariki-kai-web-6e848e
export SQL_DATABASE_NAME=kakariki-kai

# Reuse these from the Azure commands you already ran.
export AZURE_TENANT_ID=YOUR_EXISTING_TENANT_ID
export AZURE_ADMIN_OBJECT_ID=YOUR_EXISTING_OBJECT_ID
export AZURE_ADMIN_UPN="YOUR_EXISTING_UPN"

# The authority is the Kinde custom domain. The audience must match the Kinde API you create.
export KINDE_DOMAIN=https://auth.tearataea.co.nz
export KINDE_API_AUDIENCE=https://api.kakariki-kai

az deployment group create \
  --resource-group "$RG" \
  --template-file infra/azure/main.bicep \
  --parameters \
    environmentName=prod \
    location="$LOCATION" \
    staticWebAppLocation="$STATIC_WEB_APP_LOCATION" \
    apiSiteName="$API_SITE_NAME" \
    sqlServerName="$SQL_SERVER_NAME" \
    staticWebAppName="$STATIC_WEB_APP_NAME" \
    sqlDatabaseName="$SQL_DATABASE_NAME" \
    sqlEntraAdministratorObjectId="$AZURE_ADMIN_OBJECT_ID" \
    sqlEntraTenantId="$AZURE_TENANT_ID" \
    sqlEntraAdministratorLogin="$AZURE_ADMIN_UPN" \
    kindeAuthority="$KINDE_DOMAIN" \
    kindeAudience="$KINDE_API_AUDIENCE"
```

> The previous location error is fixed in GitHub revision `379f5aa`: only the Static Web App is deployed to `eastasia`; the App Service and Azure SQL database remain in `australiaeast`.

## What to send back after Azure deployment

Copy the successful deployment outputs for `apiHostName`, `staticWebAppHostName`, `apiManagedIdentityPrincipalId`, and `sqlFullyQualifiedDomainName`. I will use them to complete the remaining API, Kinde-origin, GitHub deployment-token and client-configuration work.

## References

[1] [Microsoft Learn: create an Azure SQL Database with Bicep](https://learn.microsoft.com/en-us/azure/azure-sql/database/single-database-create-bicep-quickstart?view=azuresql)

[2] [Microsoft Learn: connect App Service to Azure SQL using managed identity](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-sql-database)

[3] [Microsoft Learn: service principals and managed identities with Azure SQL](https://learn.microsoft.com/en-us/azure/azure-sql/database/authentication-aad-service-principal?view=azuresql)
