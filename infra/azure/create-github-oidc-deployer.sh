#!/usr/bin/env bash
# Run once from Azure Cloud Shell as a subscription or resource-group Owner.
# Creates the dedicated Tearataea-style GitHub deployment service principal without a client secret.
set -euo pipefail

APP_NAME="${APP_NAME:-kakariki-kai-git-deploy}"
GITHUB_REPOSITORY="${GITHUB_REPOSITORY:-piricash/k-kai-L1}"
GITHUB_ENVIRONMENT="${GITHUB_ENVIRONMENT:-production}"
RESOURCE_GROUP="${RESOURCE_GROUP:-rg-kakariki-kai-prod-aue}"

SUBSCRIPTION_ID="$(az account show --query id --output tsv)"
TENANT_ID="$(az account show --query tenantId --output tsv)"
SCOPE="/subscriptions/${SUBSCRIPTION_ID}/resourceGroups/${RESOURCE_GROUP}"

EXISTING_APP_ID="$(az ad app list --display-name "$APP_NAME" --query '[0].appId' --output tsv)"
if [[ -n "$EXISTING_APP_ID" ]]; then
  APP_ID="$EXISTING_APP_ID"
  echo "Reusing existing Entra application: $APP_NAME"
else
  APP_ID="$(az ad app create --display-name "$APP_NAME" --query appId --output tsv)"
  echo "Created Entra application: $APP_NAME"
fi

SERVICE_PRINCIPAL_ID="$(az ad sp show --id "$APP_ID" --query id --output tsv 2>/dev/null || true)"
if [[ -z "$SERVICE_PRINCIPAL_ID" ]]; then
  SERVICE_PRINCIPAL_ID="$(az ad sp create --id "$APP_ID" --query id --output tsv)"
  echo "Created service principal."
fi

if ! az role assignment list --assignee-object-id "$SERVICE_PRINCIPAL_ID" --scope "$SCOPE" --role Contributor --query '[0].id' --output tsv | grep -q .; then
  az role assignment create \
    --assignee-object-id "$SERVICE_PRINCIPAL_ID" \
    --assignee-principal-type ServicePrincipal \
    --role Contributor \
    --scope "$SCOPE" >/dev/null
  echo "Assigned Contributor at the Kākāriki Kai resource-group scope."
fi

FEDERATED_CREDENTIAL="$(mktemp)"
cat > "$FEDERATED_CREDENTIAL" <<EOF
{
  "name": "github-${GITHUB_ENVIRONMENT}",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:${GITHUB_REPOSITORY}:environment:${GITHUB_ENVIRONMENT}",
  "description": "GitHub Actions OIDC trust for Kākāriki Kai ${GITHUB_ENVIRONMENT} deployments",
  "audiences": ["api://AzureADTokenExchange"]
}
EOF

if ! az ad app federated-credential list --id "$APP_ID" --query "[?name=='github-${GITHUB_ENVIRONMENT}'].name" --output tsv | grep -q .; then
  az ad app federated-credential create --id "$APP_ID" --parameters "$FEDERATED_CREDENTIAL" >/dev/null
  echo "Created GitHub OIDC federated credential."
fi
rm -f "$FEDERATED_CREDENTIAL"

printf '\nAdd these as GitHub Actions secrets for piricash/k-kai-L1:\n'
printf 'AZURE_CLIENT_ID=%s\n' "$APP_ID"
printf 'AZURE_TENANT_ID=%s\n' "$TENANT_ID"
printf 'AZURE_SUBSCRIPTION_ID=%s\n' "$SUBSCRIPTION_ID"
printf '\nThe principal has Contributor only on: %s\n' "$SCOPE"
