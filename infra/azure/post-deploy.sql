/*
Run as the configured Microsoft Entra Azure SQL administrator after Bicep deployment.
Replace KAKARIKI_KAI_API_NAME with the deployed App Service name. The runtime identity
needs data access only; schema migrations execute through the controlled release job.
*/
CREATE USER [KAKARIKI_KAI_API_NAME] FROM EXTERNAL PROVIDER;
ALTER ROLE db_datareader ADD MEMBER [KAKARIKI_KAI_API_NAME];
ALTER ROLE db_datawriter ADD MEMBER [KAKARIKI_KAI_API_NAME];
GO
