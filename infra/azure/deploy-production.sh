#!/usr/bin/env bash
# Kākāriki Kai Azure-only production deployment. Run from Azure Cloud Shell after git pull origin main.
set -euo pipefail

RG="${RG:-rg-kakariki-kai-prod-aue}"
LOCATION="${LOCATION:-australiaeast}"
STATIC_WEB_APP_LOCATION="${STATIC_WEB_APP_LOCATION:-eastasia}"
API_SITE_NAME="${API_SITE_NAME:-kakariki-kai-api-6e848e}"
SQL_SERVER_NAME="${SQL_SERVER_NAME:-kkai-sql-6e848e}"
STATIC_WEB_APP_NAME="${STATIC_WEB_APP_NAME:-kakariki-kai-web-6e848e}"
SQL_DATABASE_NAME="${SQL_DATABASE_NAME:-kakariki-kai}"
KINDE_AUTHORITY="${KINDE_AUTHORITY:-https://auth.tearataea.co.nz}"
KINDE_API_AUDIENCE="${KINDE_API_AUDIENCE:-https://api.kakariki-kai}"

AZURE_TENANT_ID="$(az account show --query tenantId -o tsv)"
AZURE_ADMIN_OBJECT_ID="$(az ad signed-in-user show --query id -o tsv)"
AZURE_ADMIN_DISPLAY_NAME="$(az ad signed-in-user show --query displayName -o tsv)"

if [[ -z "$AZURE_TENANT_ID" || -z "$AZURE_ADMIN_OBJECT_ID" || -z "$AZURE_ADMIN_DISPLAY_NAME" ]]; then
  echo "Azure tenant, signed-in user object ID, or display name was empty. Confirm az login and retry." >&2
  exit 1
fi

printf 'Deploying as Entra SQL administrator display name: %s\n' "$AZURE_ADMIN_DISPLAY_NAME"

az deployment group create \
  --name kakariki-kai-prod-infrastructure \
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
    sqlEntraAdministratorLogin="$AZURE_ADMIN_DISPLAY_NAME" \
    kindeAuthority="$KINDE_AUTHORITY" \
    kindeAudience="$KINDE_API_AUDIENCE" \
  --query properties.outputs \
  --output json
