# ColdChain Backend (C# .NET 8)

Backend module for temperature and humidity monitoring of refrigeration units using JOLT sensors. Implements data ingestion, threshold-based alerting, and REST endpoints for units, thresholds, readings, and alerts.

---

## Architecture
- **Domain model:** `Device`, `Sensor`, `RefrigerationUnit`, `Reading`, `Threshold`, `Alert`.
- **Storage:** SQL Server 2022 via EF Core (code-first).
- **Ingestion:** Background polling service. Pluggable JOLT client (`Fake`, `PullApi`, `Webhook`).
- **Alerting:** Evaluates thresholds per unit and metric; opens/closes alerts.
- **HTTP API:** Minimal APIs for CRUD and queries.

---

## Tech Stack
- **Runtime:** .NET 8  
- **Web:** ASP.NET Core Minimal APIs  
- **ORM:** Entity Framework Core (SQL Server)  
- **Docs/UI:** Swagger (Swashbuckle)  
- **HTTP Client:** `HttpClientFactory`  
- **Build/OS:** Linux-first, cross-platform

---

## Prerequisites
- .NET 8 SDK  
- SQL Server 2022 reachable at `localhost:1433` (or adjust connection string)  
- Optional GUI client (DataGrip or Azure Data Studio)

---

## Configuration
Edit `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "Sql": "Server=localhost,1433;Database=ColdChain;User Id=sa;Password=Str0ng!Passw0rd;TrustServerCertificate=True"
  },
  "Jolt": {
    "Mode": "Fake",         // Fake | PullApi | Webhook
    "BaseUrl": "https://api.jolt.com",
    "ApiKey": "",
    "PollSeconds": 60,
    "WebhookSecret": ""
  }
}

## Setup

```bash
cd backend/ColdChain.Api
dotnet build
dotnet ef database update   # only if you changed migrations
dotnet run