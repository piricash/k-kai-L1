# Kākāriki Kai — Azure SQL administrator login recovery

## What failed

The Bicep deployment reached the Azure SQL logical-server step and failed only on the Microsoft Entra administrator **login** value:

> `Invalid value given for parameter Login.`

The resource group is intact and the deployment is safe to rerun. The Cloud Shell paste was corrupted before `AZURE_ADMIN_UPN` and related variables were set; do not reuse those earlier exported values.

## Run this corrected one-command deployment

```bash
cd ~/k-kai-L1
git pull origin main
bash infra/azure/deploy-production.sh
```

The script obtains the tenant ID, object ID and **display name** itself. It intentionally does not use your external guest UPN (`...#EXT#...`), which Azure SQL rejected as its administrator `login` parameter.

## Expected result

The command must finish with outputs for `apiHostName`, `staticWebAppHostName`, `apiManagedIdentityPrincipalId`, and `sqlFullyQualifiedDomainName`. Send that JSON output back exactly as shown.

The Bicep linter messages about quoted app-setting property names and the `database.windows.net` suffix are warnings, not the deployment failure. The revised template also adds a system-assigned Azure SQL server identity; before using `CREATE USER ... FROM EXTERNAL PROVIDER`, a Microsoft Entra administrator must grant that server identity the necessary Microsoft Graph lookup rights or add it to the approved Directory Readers group. [1]

## Reference

[1] [Microsoft Learn: service principals and managed identities with Azure SQL](https://learn.microsoft.com/en-us/azure/azure-sql/database/authentication-aad-service-principal?view=azuresql)
