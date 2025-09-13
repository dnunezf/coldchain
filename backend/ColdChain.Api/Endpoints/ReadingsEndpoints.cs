using ColdChain.Api.Domain.Entities;
using ColdChain.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace ColdChain.Api.Endpoints;

public static class ReadingsEndpoints
{
    public static void MapReadings(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/readings");
        g.MapGet("", async (AppDbContext db, int unitId, DateTime? from, DateTime? to, int? metric) =>
        {
            var q = db.Readings
                .AsNoTracking()
                .Include(r => r.Sensor)
                .Where(r => r.Sensor.RefrigerationUnitId == unitId);

            if (from is not null) q = q.Where(r => r.RecordedAtUtc >= from);
            if (to is not null) q = q.Where(r => r.RecordedAtUtc <= to);

            if (metric is not null)
            {
                var type = (Metric)metric == Metric.Temperature ? SensorType.Temperature : SensorType.Humidity;
                q = q.Where(r => r.Sensor.Type == type);
            }

            return await q
                .OrderBy(r => r.RecordedAtUtc)
                .Select(r => new
                {
                    sensorType = r.Sensor.Type,
                    value = r.Value,
                    recordedAtUtc = r.RecordedAtUtc
                })
                .ToListAsync();
        });
    }
}
