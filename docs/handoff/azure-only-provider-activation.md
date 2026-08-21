# Kākāriki Kai — Azure-only provider activation

> The production topology is now wholly Azure: **Azure Static Web Apps** hosts the React client, **Azure App Service** hosts the .NET 10 API, and **Azure SQL** holds authoritative data. Vercel is not required for the production path.

## 1. Create Kinde configuration

Create a Kinde SPA/front-end application and API. At this stage, register `http://localhost:3000` only. After the Azure infrastructure deployment in step 2, add the exact Static Web Apps hostname output as both callback and logout URL, in this form:

```text
https://YOUR_STATIC_WEB_APP_HOSTNAME
```

Create `kaiMenu:manage` and `kaiBookings:view`. Attach both to an organization-scoped **KaiChef** role. Assign the role to one test account and retain a second ordinary Kaimahi test account without either permission. Access tokens must include `org_code` and `permissions`.

## 2. Deploy all hosting resources to Azure

In Azure Cloud Shell, run:

```bash
git clone https://github.com/piricash/k-kai-L1.git
cd k-kai-L1

az account show --query '{tenantId:tenantId,upn:user.name}' -o json
az ad signed-in-user show --query id -o tsv

export RG=rg-kakariki-kai-prod-aue
export LOCATION=australiaeast
export STATIC_WEB_APP_LOCATION=eastasia
export API_SITE_NAME=kakariki-kai-api-REPLACE_WITH_UNIQUE_NAME
export SQL_SERVER_NAME=kkai-sql-REPLACE_WITH_UNIQUE_NAME
export STATIC_WEB_APP_NAME=kakariki-kai-web-REPLACE_WITH_UNIQUE_NAME
export AZURE_TENANT_ID=REPLACE_WITH_AZURE_TENANT_ID
export AZURE_ADMIN_OBJECT_ID=REPLACE_WITH_SIGNED_IN_USER_OBJECT_ID
export AZURE_ADMIN_UPN=REPLACE_WITH_YOUR_ENTRA_UPN
export KINDE_DOMAIN=https://REPLACE_WITH_YOUR_KINDE_SUBDOMAIN.kinde.com
export KINDE_API_AUDIENCE=REPLACE_WITH_YOUR_KINDE_API_AUDIENCE

az group create --name "$RG" --location "$LOCATION"
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
    sqlEntraAdministratorObjectId="$AZURE_ADMIN_OBJECT_ID" \
    sqlEntraTenantId="$AZURE_TENANT_ID" \
    sqlEntraAdministratorLogin="$AZURE_ADMIN_UPN" \
    kindeAuthority="$KINDE_DOMAIN" \
    kindeAudience="$KINDE_API_AUDIENCE"
```

Keep `LOCATION=australiaeast` for the API and Azure SQL database. `STATIC_WEB_APP_LOCATION=eastasia` is intentional: Azure Static Web Apps is not currently available in Australia East, and East Asia is the closest supported region for this resource. Save the `apiHostName`, `staticWebAppHostName`, and `apiManagedIdentityPrincipalId` outputs. Add `https://STATIC_WEB_APP_HOSTNAME` to the Kinde application callback and logout URLs.

## 3. Grant SQL access and apply the schema

Add a temporary firewall rule for your current IP, then use the Azure SQL Query Editor as the configured Microsoft Entra administrator. Run `infra/azure/post-deploy.sql`, replacing `KAKARIKI_KAI_API_NAME` with `$API_SITE_NAME`.

Generate the idempotent committed schema script and execute its contents in Query Editor:

```bash
dotnet ef migrations script --idempotent \
  --project src/KakarikiKai.Infrastructure/KakarikiKai.Infrastructure.csproj \
  --startup-project src/KakarikiKai.WebAPI/KakarikiKai.WebAPI.csproj \
  --output kakariki-kai-schema.sql
```

Publish the API:

```bash
dotnet publish src/KakarikiKai.WebAPI/KakarikiKai.WebAPI.csproj -c Release -o ./publish-api
cd publish-api && zip -r ../kakariki-kai-api.zip . && cd ..
az webapp deploy --resource-group "$RG" --name "$API_SITE_NAME" --src-path ./kakariki-kai-api.zip --type zip
curl -i "https://${API_SITE_NAME}.azurewebsites.net/health"
```

## 4. Build and deploy the Azure Static Web App

In Azure Portal, open the new Static Web App, select **Overview → Manage deployment token**, and copy the token. In the GitHub repository, open **Settings → Secrets and variables → Actions** and add these repository secrets:

| GitHub secret | Value |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | The Static Web Apps deployment token |
| `VITE_KINDE_DOMAIN` | Your Kinde domain, including `https://` |
| `VITE_KINDE_CLIENT_ID` | The Kinde SPA client ID |
| `VITE_KINDE_API_AUDIENCE` | The Kinde API audience |
| `VITE_KAKARIKI_API_URL` | `https://YOUR_API_SITE_NAME.azurewebsites.net` |

The committed `azure-static-web-apps.yml` workflow builds and uploads the Vite output to Azure Static Web Apps on a push to `main`. Trigger it by pushing a harmless documentation change or use **Actions → Deploy Kākāriki Kai web to Azure Static Web Apps → Run workflow**.

## 5. Verify access

The `staticWebAppHostName` output is the production URL. It should show **Sign in**, not **SSO setup pending**. Verify that the API health route returns `200`, an unauthenticated weekly-menu request returns `401`, an ordinary Kaimahi can read the menu, and the ordinary Kaimahi receives `403` from the chef service endpoint while a KaiChef does not.

The visible meal cards still use the approved POC data adapter until the next API-read UI integration. The current Azure work activates hosting, sign-in, and the protected API; it does not yet make Azure SQL the visible booking-card source.

## References

[1] [Azure Static Web Apps with Bicep](https://learn.microsoft.com/en-us/azure/static-web-apps/publish-bicep)

[2] [Azure Static Web Apps deployment tokens](https://learn.microsoft.com/en-us/azure/static-web-apps/deployment-token-management)

[3] [Kinde .NET API authentication](https://docs.kinde.com/developer-tools/your-apis/dotnet-based-apis/)
