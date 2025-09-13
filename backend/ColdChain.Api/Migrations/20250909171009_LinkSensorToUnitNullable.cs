using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ColdChain.Api.Migrations
{
    /// <inheritdoc />
    public partial class LinkSensorToUnitNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RefrigerationUnitId",
                table: "Sensors",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sensors_RefrigerationUnitId",
                table: "Sensors",
                column: "RefrigerationUnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_Sensors_RefrigerationUnits_RefrigerationUnitId",
                table: "Sensors",
                column: "RefrigerationUnitId",
                principalTable: "RefrigerationUnits",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sensors_RefrigerationUnits_RefrigerationUnitId",
                table: "Sensors");

            migrationBuilder.DropIndex(
                name: "IX_Sensors_RefrigerationUnitId",
                table: "Sensors");

            migrationBuilder.DropColumn(
                name: "RefrigerationUnitId",
                table: "Sensors");
        }
    }
}
