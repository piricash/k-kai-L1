using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KakarikiKai.Infrastructure.Data.Migrations
{
    public partial class InitialKaiSchema : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // This is the first committed production baseline. The Azure database may
            // already contain the same POC tables, so adoption must never drop data.
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[dbo].[Meals]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[Meals] (
                        [Id] uniqueidentifier NOT NULL,
                        [Name] nvarchar(120) NOT NULL,
                        [Description] nvarchar(600) NOT NULL,
                        [DietaryConfiguration] nvarchar(max) NOT NULL,
                        [TenantCode] nvarchar(100) NOT NULL,
                        CONSTRAINT [PK_Meals] PRIMARY KEY ([Id])
                    );
                END;

                IF COL_LENGTH(N'dbo.Meals', N'TenantCode') IS NULL
                    ALTER TABLE [dbo].[Meals] ADD [TenantCode] nvarchar(100) NOT NULL CONSTRAINT [DF_Meals_TenantCode] DEFAULT N'legacy';
                IF COL_LENGTH(N'dbo.Meals', N'Name') IS NULL
                    ALTER TABLE [dbo].[Meals] ADD [Name] nvarchar(120) NOT NULL CONSTRAINT [DF_Meals_Name] DEFAULT N'Untitled meal';
                IF COL_LENGTH(N'dbo.Meals', N'Description') IS NULL
                    ALTER TABLE [dbo].[Meals] ADD [Description] nvarchar(600) NOT NULL CONSTRAINT [DF_Meals_Description] DEFAULT N'';
                IF COL_LENGTH(N'dbo.Meals', N'DietaryConfiguration') IS NULL
                    ALTER TABLE [dbo].[Meals] ADD [DietaryConfiguration] nvarchar(max) NOT NULL CONSTRAINT [DF_Meals_DietaryConfiguration] DEFAULT N'[]';

                IF OBJECT_ID(N'[dbo].[MenuDays]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[MenuDays] (
                        [Id] uniqueidentifier NOT NULL,
                        [ServiceDate] date NOT NULL,
                        [MealId] uniqueidentifier NULL,
                        [Price] decimal(9,2) NOT NULL,
                        [Published] bit NOT NULL,
                        [TenantCode] nvarchar(100) NOT NULL,
                        CONSTRAINT [PK_MenuDays] PRIMARY KEY ([Id])
                    );
                END;

                IF COL_LENGTH(N'dbo.MenuDays', N'TenantCode') IS NULL
                    ALTER TABLE [dbo].[MenuDays] ADD [TenantCode] nvarchar(100) NOT NULL CONSTRAINT [DF_MenuDays_TenantCode] DEFAULT N'legacy';
                IF COL_LENGTH(N'dbo.MenuDays', N'ServiceDate') IS NULL
                    ALTER TABLE [dbo].[MenuDays] ADD [ServiceDate] date NOT NULL CONSTRAINT [DF_MenuDays_ServiceDate] DEFAULT CAST(GETUTCDATE() AS date);
                IF COL_LENGTH(N'dbo.MenuDays', N'MealId') IS NULL
                    ALTER TABLE [dbo].[MenuDays] ADD [MealId] uniqueidentifier NULL;
                IF COL_LENGTH(N'dbo.MenuDays', N'Price') IS NULL
                    ALTER TABLE [dbo].[MenuDays] ADD [Price] decimal(9,2) NOT NULL CONSTRAINT [DF_MenuDays_Price] DEFAULT 5.00;
                IF COL_LENGTH(N'dbo.MenuDays', N'Published') IS NULL
                    ALTER TABLE [dbo].[MenuDays] ADD [Published] bit NOT NULL CONSTRAINT [DF_MenuDays_Published] DEFAULT 0;

                IF OBJECT_ID(N'[dbo].[Bookings]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[Bookings] (
                        [Id] uniqueidentifier NOT NULL,
                        [MenuDayId] uniqueidentifier NOT NULL,
                        [ActorSubject] nvarchar(160) NOT NULL,
                        [DisplayName] nvarchar(160) NOT NULL,
                        [RequestedDietaryOptions] nvarchar(max) NOT NULL,
                        [TenantCode] nvarchar(100) NOT NULL,
                        CONSTRAINT [PK_Bookings] PRIMARY KEY ([Id])
                    );
                END;

                IF COL_LENGTH(N'dbo.Bookings', N'TenantCode') IS NULL
                    ALTER TABLE [dbo].[Bookings] ADD [TenantCode] nvarchar(100) NOT NULL CONSTRAINT [DF_Bookings_TenantCode] DEFAULT N'legacy';
                IF COL_LENGTH(N'dbo.Bookings', N'MenuDayId') IS NULL
                    ALTER TABLE [dbo].[Bookings] ADD [MenuDayId] uniqueidentifier NOT NULL CONSTRAINT [DF_Bookings_MenuDayId] DEFAULT '00000000-0000-0000-0000-000000000000';
                IF COL_LENGTH(N'dbo.Bookings', N'ActorSubject') IS NULL
                    ALTER TABLE [dbo].[Bookings] ADD [ActorSubject] nvarchar(160) NOT NULL CONSTRAINT [DF_Bookings_ActorSubject] DEFAULT N'legacy';
                IF COL_LENGTH(N'dbo.Bookings', N'DisplayName') IS NULL
                    ALTER TABLE [dbo].[Bookings] ADD [DisplayName] nvarchar(160) NOT NULL CONSTRAINT [DF_Bookings_DisplayName] DEFAULT N'Legacy booking';
                IF COL_LENGTH(N'dbo.Bookings', N'RequestedDietaryOptions') IS NULL
                    ALTER TABLE [dbo].[Bookings] ADD [RequestedDietaryOptions] nvarchar(max) NOT NULL CONSTRAINT [DF_Bookings_RequestedDietaryOptions] DEFAULT N'[]';

                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_MenuDays_Meals_MealId')
                    ALTER TABLE [dbo].[MenuDays] ADD CONSTRAINT [FK_MenuDays_Meals_MealId] FOREIGN KEY ([MealId]) REFERENCES [dbo].[Meals] ([Id]);
                IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Bookings_MenuDays_MenuDayId')
                    ALTER TABLE [dbo].[Bookings] ADD CONSTRAINT [FK_Bookings_MenuDays_MenuDayId] FOREIGN KEY ([MenuDayId]) REFERENCES [dbo].[MenuDays] ([Id]);

                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Meals]') AND name = N'IX_Meals_TenantCode_Name')
                    CREATE UNIQUE INDEX [IX_Meals_TenantCode_Name] ON [dbo].[Meals] ([TenantCode], [Name]);
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[MenuDays]') AND name = N'IX_MenuDays_MealId')
                    CREATE INDEX [IX_MenuDays_MealId] ON [dbo].[MenuDays] ([MealId]);
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[MenuDays]') AND name = N'IX_MenuDays_TenantCode_ServiceDate')
                    CREATE UNIQUE INDEX [IX_MenuDays_TenantCode_ServiceDate] ON [dbo].[MenuDays] ([TenantCode], [ServiceDate]);
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Bookings]') AND name = N'IX_Bookings_MenuDayId')
                    CREATE INDEX [IX_Bookings_MenuDayId] ON [dbo].[Bookings] ([MenuDayId]);
                IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Bookings]') AND name = N'IX_Bookings_TenantCode_MenuDayId_ActorSubject')
                    CREATE UNIQUE INDEX [IX_Bookings_TenantCode_MenuDayId_ActorSubject] ON [dbo].[Bookings] ([TenantCode], [MenuDayId], [ActorSubject]);
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder) =>
            throw new NotSupportedException("The initial production baseline is intentionally non-destructive and cannot be rolled back automatically.");
    }
}
