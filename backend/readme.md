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
```

---

## Setup

# Database

```bash
cd backend/ColdChain.Api
dotnet tool install --global dotnet-ef            # once
dotnet ef migrations add Initial                  # first time
dotnet ef database update
```

# Build And Run

```bash
cd backend/ColdChain.Api
dotnet build
dotnet run
```

API will be available at:

```bash
http://localhost:5277/swagger
```

---

## Health and Info

```bash
curl http://localhost:5277/api/health
curl http://localhost:5277/api/jolt/info
```

---

## Units

```bash
curl http://localhost:5277/api/units
```

---

## Thresholds

```bash
curl http://localhost:5277/api/thresholds/1
```

Update threshold:

```bash
curl -X PUT http://localhost:5277/api/thresholds \
  -H "Content-Type: application/json" \
  -d '{"refrigerationUnitId":1,"metric":1,"min":-20,"max":-10}'
```

---

## Readings

```bash
curl "http://localhost:5277/api/readings?unitId=1&from=2025-09-14T00:00:00Z"
```

---

## Alerts

```bash
curl "http://localhost:5277/api/alerts?unitId=1&status=1"
```
