@description('Short lowercase environment label, such as dev or stg.')
param environmentName string

@description('Azure region for the API and Azure SQL logical server.')
param location string = resourceGroup().location

@description('Globally unique API site name.')
param apiSiteName string

@description('Globally unique Azure SQL logical-server name.')
param sqlServerName string

@description('Azure SQL database name.')
param sqlDatabaseName string = 'kakariki-kai'

@description('Microsoft Entra object ID of the Azure SQL administrator.')
param sqlEntraAdministratorObjectId string

@description('Microsoft Entra tenant ID that owns the Azure SQL administrator.')
param sqlEntraTenantId string

@description('UPN or display name for the Azure SQL Microsoft Entra administrator.')
param sqlEntraAdministratorLogin string

@description('Kinde issuer URL, for example https://your-business.kinde.com.')
param kindeAuthority string

@description('The Kinde API audience registered for the Kākāriki Kai API.')
param kindeAudience string

@description('The exact React application origin allowed to call this API.')
param allowedOrigin string

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: 'asp-kakariki-kai-${environmentName}'
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: true
  }
}

resource api 'Microsoft.Web/sites@2024-04-01' = {
  name: apiSiteName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|10.0'
      minTlsVersion: '1.2'
      alwaysOn: true
    }
  }
}

resource apiAppSettings 'Microsoft.Web/sites/config@2024-04-01' = {
  parent: api
  name: 'appsettings'
  properties: {
    'ConnectionStrings__KakarikiKai': 'Server=tcp:${sqlServer.name}.database.windows.net,1433;Initial Catalog=${sqlDatabaseName};Authentication=Active Directory Default;Encrypt=True;TrustServerCertificate=False;'
    'Kinde__Authority': kindeAuthority
    'Kinde__Audience': kindeAudience
    'Cors__AllowedOrigins__0': allowedOrigin
  }
}

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    publicNetworkAccess: 'Enabled'
    minimalTlsVersion: '1.2'
  }
}

resource sqlEntraAdmin 'Microsoft.Sql/servers/administrators@2023-08-01-preview' = {
  parent: sqlServer
  name: 'ActiveDirectory'
  properties: {
    administratorType: 'ActiveDirectory'
    login: sqlEntraAdministratorLogin
    sid: sqlEntraAdministratorObjectId
    tenantId: sqlEntraTenantId
  }
}

resource database 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
  }
}

output apiHostName string = api.properties.defaultHostName
output apiManagedIdentityPrincipalId string = api.identity.principalId
output sqlFullyQualifiedDomainName string = sqlServer.properties.fullyQualifiedDomainName
