using ColdChain.Api.Application.Abstractions;
using ColdChain.Api.Application.Models;
using ColdChain.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ColdChain.Api.Infrastructure.Services;

public sealed class ReadingIngestor : IReadingIngestor
{
    private readonly AppDbContext _db;

    public ReadingIngestor(AppDbContext db) => _db = db;

    public async Task IngestAsync(IReadOnlyList<JoltReading> readings, CancellationToken ct = default)
    {
        if (readings.Count == 0) return;

        // Preload devices and sensors map
        var devices = await _db.Devices.AsNoTracking().ToListAsync(ct);
        var sensors = await _db.Sensors
            .Include(s => s.RefrigerationUnit)
            .AsNoTracking()
            .ToListAsync(ct);

        var deviceByExt = devices.ToDictionary(d => d.ExternalId);
        var sensorByType = sensors
            .GroupBy(s => (s.DeviceId, s.Type))
            .ToDictionary(g => g.Key, g => g.First());

        var toInsert = new List<Reading>();

        foreach (var r in readings)
        {
            if (!deviceByExt.TryGetValue(r.DeviceExternalId, out var dev)) continue;
            var type = (SensorType)r.SensorType;
            if (!sensorByType.TryGetValue((dev.Id, type), out var sensor)) continue;

            toInsert.Add(new Reading
            {
                SensorId = sensor.Id,
                Value = r.Value,
                RecordedAtUtc = r.RecordedAtUtc
            });

            await EvaluateAlertAsync(sensor, r.Value, r.RecordedAtUtc, ct);
        }

        if (toInsert.Count > 0)
        {
            await _db.Readings.AddRangeAsync(toInsert, ct);
            await _db.SaveChangesAsync(ct);
        }
    }

    private async Task EvaluateAlertAsync(Sensor sensor, decimal value, DateTime atUtc, CancellationToken ct)
    {
        if (sensor.RefrigerationUnitId is null) return;

        var metric = sensor.Type == SensorType.Temperature ? Metric.Temperature : Metric.Humidity;
        var th = await _db.Thresholds
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.RefrigerationUnitId == sensor.RefrigerationUnitId && x.Metric == metric, ct);
        if (th is null) return;

        var outOfRange = value < th.Min || value > th.Max;

        // Find latest open alert for that unit+metric
        var open = await _db.Alerts
            .Where(a => a.RefrigerationUnitId == sensor.RefrigerationUnitId && a.Metric == metric && a.Status == AlertStatus.Open)
            .OrderByDescending(a => a.OpenedAtUtc)
            .FirstOrDefaultAsync(ct);

        if (outOfRange)
        {
            if (open is null)
            {
                _db.Alerts.Add(new Alert
                {
                    RefrigerationUnitId = th.RefrigerationUnitId,
                    Metric = metric,
                    OpenedAtUtc = atUtc,
                    Status = AlertStatus.Open
                });
                await _db.SaveChangesAsync(ct);
            }
        }
        else
        {
            if (open is not null)
            {
                open.Status = AlertStatus.Closed;
                open.ClosedAtUtc = atUtc;
                _db.Alerts.Update(open);
                await _db.SaveChangesAsync(ct);
            }
        }
    }
}
