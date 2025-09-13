/*INSTALLATION GUIDE:
    cd backend/Coldchain.Api
    
    # Install EF Core CLI (just once)
    dotnet tool install --global dotnet-ef

    # Create first migration
    dotnet ef migrations add Initial

    # Apply migration and create db
    dotnet ef database update

    # Test API
    dotnet run
*/

using ColdChain.Api.Endpoints;
using ColdChain.Api.Infrastructure;
using ColdChain.Api.Infrastructure.Jolt;
using ColdChain.Api.Infrastructure.Options;
using ColdChain.Api.Infrastructure.Seed;
using ColdChain.Api.Infrastructure.Services;
using ColdChain.Api.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JoltOptions>(builder.Configuration.GetSection("Jolt"));
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Sql")));
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// DI
builder.Services.AddSingleton<IJoltClient, FakeJoltClient>();
builder.Services.AddScoped<IReadingIngestor, ReadingIngestor>();
builder.Services.AddHostedService<JoltPollingService>();

var app = builder.Build();
app.UseCors();
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await DataSeeder.SeedAsync(db);
}

app.MapUnits();
app.MapThresholds();
app.MapReadings();
app.MapAlerts();

app.Run();
