using KakarikiKai.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KakarikiKai.Infrastructure.Migrations;

[DbContext(typeof(KakarikiKaiDbContext))]
[Migration("202608210001_InitialKakarikiKaiSchema")]
public partial class InitialKakarikiKaiSchema : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "Meals",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                TenantCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                Description = table.Column<string>(type: "nvarchar(600)", maxLength: 600, nullable: false),
                DietaryConfiguration = table.Column<string>(type: "nvarchar(max)", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Meals", row => row.Id);
            });

        migrationBuilder.CreateTable(
            name: "MenuDays",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                TenantCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                ServiceDate = table.Column<DateOnly>(type: "date", nullable: false),
                MealId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                Price = table.Column<decimal>(type: "decimal(9,2)", precision: 9, scale: 2, nullable: false),
                Published = table.Column<bool>(type: "bit", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_MenuDays", row => row.Id);
                table.ForeignKey(
                    name: "FK_MenuDays_Meals_MealId",
                    column: row => row.MealId,
                    principalTable: "Meals",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "Bookings",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                TenantCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                MenuDayId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                ActorSubject = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                DisplayName = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                RequestedDietaryOptions = table.Column<string>(type: "nvarchar(max)", nullable: false),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_Bookings", row => row.Id);
                table.ForeignKey(
                    name: "FK_Bookings_MenuDays_MenuDayId",
                    column: row => row.MenuDayId,
                    principalTable: "MenuDays",
                    principalColumn: "Id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(
            name: "IX_Meals_TenantCode_Name",
            table: "Meals",
            columns: new[] { "TenantCode", "Name" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_MenuDays_MealId",
            table: "MenuDays",
            column: "MealId");

        migrationBuilder.CreateIndex(
            name: "IX_MenuDays_TenantCode_ServiceDate",
            table: "MenuDays",
            columns: new[] { "TenantCode", "ServiceDate" },
            unique: true);

        migrationBuilder.CreateIndex(
            name: "IX_Bookings_MenuDayId",
            table: "Bookings",
            column: "MenuDayId");

        migrationBuilder.CreateIndex(
            name: "IX_Bookings_TenantCode_MenuDayId_ActorSubject",
            table: "Bookings",
            columns: new[] { "TenantCode", "MenuDayId", "ActorSubject" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "Bookings");
        migrationBuilder.DropTable(name: "MenuDays");
        migrationBuilder.DropTable(name: "Meals");
    }
}
