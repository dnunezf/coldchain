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

using ColdChain.Api.Application.Abstractions;
using ColdChain.Api.Endpoints;
using ColdChain.Api.Infrastructure;
using ColdChain.Api.Infrastructure.Jolt;
using ColdChain.Api.Infrastructure.Options;
using ColdChain.Api.Infrastructure.Seed;
using ColdChain.Api.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Options
builder.Services.Configure<JoltOptions>(builder.Configuration.GetSection("Jolt"));

// Db
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Sql")));

// CORS for React dev
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// HTTP for PullApi mode
builder.Services.AddHttpClient();

// IJoltClient factory by mode: Fake | PullApi
builder.Services.AddSingleton<IJoltClient>(sp =>
{
    var opt = sp.GetRequiredService<IOptions<JoltOptions>>().Value;
    return opt.Mode switch
    {
        "PullApi" => new JoltApiClient(
            sp.GetRequiredService<IHttpClientFactory>(),
            sp.GetRequiredService<IOptions<JoltOptions>>()),
        _ => new FakeJoltClient()
    };
});

// Ingestion + background polling
builder.Services.AddScoped<IReadingIngestor, ReadingIngestor>();
builder.Services.AddHostedService<JoltPollingService>();

var app = builder.Build();

// Middleware
app.UseCors();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Health + Jolt info
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/api/jolt/info", (IOptions<JoltOptions> o) =>
    Results.Ok(new { mode = o.Value.Mode, pollSeconds = o.Value.PollSeconds }));

// DB migrate + seed
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await DataSeeder.SeedAsync(db);
}

// Endpoints
app.MapUnits();
app.MapThresholds();
app.MapReadings();
app.MapAlerts();
app.MapJoltWebhook();

app.Run();