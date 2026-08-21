# Kinde and Azure implementation notes

## Kinde API security

Kinde’s .NET API guidance specifies ASP.NET JWT bearer authentication with Kinde `Authority`, an API `ValidAudiences` value, and `NameClaimType` mapped to `sub`. It demonstrates permission and role policies built against claims, and notes that Kinde roles do not automatically map to ASP.NET `RequireRole`; the application must use an explicit claim-based policy. JWT verification must validate RS256 signatures plus issuer and audience claims. [1] [2]

For the SPA, use Kinde’s front-end/mobile application type and PKCE. The React client passes an access token in the `Authorization: Bearer` header to the API. The token includes organization context and permissions for the active organization; the API remains responsible for validation and authorization. A production SPA should use a Kinde custom domain for secure HttpOnly refresh-token cookies rather than browser local storage. [3] [4]

The configured role model is `KaiChef` with `kaiMenu:manage` and `kaiBookings:view`. Kinde supports organization-scoped roles and permissions, recommends permissions for feature access, and can include roles in access-token claims when enabled in access-token customization. [5]

## Azure SQL and App Service

Azure recommends passwordless Azure SQL connections using `Authentication=Active Directory Default`. On App Service, the SqlClient provider can obtain the token from the app’s managed identity; locally it uses the developer’s authenticated Azure credential. Azure SQL needs a Microsoft Entra administrator, a database user for the managed identity, and least-privilege database roles. [6] [7]

The planned backend uses SQL Server EF Core migrations. Production deployment will set a passwordless connection string through an environment setting, enable a system-assigned managed identity, and scope database permissions. The migration path is expand, deploy compatible application code, reconcile, then switch traffic; it never includes source-controlled credentials.

## Sources

[1] [Kinde: Integrate auth into .NET APIs](https://docs.kinde.com/developer-tools/your-apis/dotnet-based-apis/)

[2] [Kinde: Verifying JSON Web Tokens](https://docs.kinde.com/build/tokens/verifying-json-web-tokens/)

[3] [Kinde: Authenticating single-page apps](https://docs.kinde.com/build/applications/authenticating-spa/)

[4] [Kinde: JavaScript SDK](https://docs.kinde.com/developer-tools/sdks/frontend/javascript-sdk/)

[5] [Kinde: Manage user roles](https://docs.kinde.com/manage-users/roles-and-permissions/user-roles/)

[6] [Microsoft Learn: App Service managed identity and Azure SQL](https://learn.microsoft.com/en-us/azure/app-service/tutorial-connect-msi-sql-database)

[7] [Microsoft Learn: EF Core with Azure SQL](https://learn.microsoft.com/en-us/azure/azure-sql/database/azure-sql-dotnet-entity-framework-core-quickstart?view=azuresql)
