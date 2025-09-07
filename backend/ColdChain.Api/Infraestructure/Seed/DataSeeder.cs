using ColdChain.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ColdChain.Api.Infrastructure.Seed;

public static class DataSeeder
{
    public static async Task SeedAsync(AppDbContext db, CancellationToken ct = default)
    {
        if (await db.RefrigerationUnits.AnyAsync(ct)) return;

        var unit1 = new RefrigerationUnit { Name = "Freezer A", Location = "Warehouse 1" };
        var unit2 = new RefrigerationUnit { Name = "Fridge B", Location = "Lab 2" };
        db.RefrigerationUnits.AddRange(unit1, unit2);

        var dev = new Device { ExternalId = "DEV-LOCAL-001", Name = "Jolt Mock Device" };
        var sTemp = new Sensor { Device = dev, Type = SensorType.Temperature, Unit = "°C" };
        var sHum = new Sensor { Device = dev, Type = SensorType.Humidity, Unit = "%" };
        db.Sensors.AddRange(sTemp, sHum);

        db.Thresholds.AddRange(
            new Threshold { RefrigerationUnit = unit1, Metric = Metric.Temperature, Min = -20, Max = -10 },
            new Threshold { RefrigerationUnit = unit1, Metric = Metric.Humidity, Min = 30, Max = 70 },
            new Threshold { RefrigerationUnit = unit2, Metric = Metric.Temperature, Min = 2, Max = 8 },
            new Threshold { RefrigerationUnit = unit2, Metric = Metric.Humidity, Min = 30, Max = 70 }
        );

        var now = DateTime.UtcNow;
        var readings = new List<Reading>();
        for (int i = 0; i < 60; i++)
        {
            readings.Add(new Reading { Sensor = sTemp, Value = -15 + (decimal)Math.Sin(i / 6.0) * 2, RecordedAtUtc = now.AddMinutes(-i) });
            readings.Add(new Reading { Sensor = sHum, Value = 55 + (decimal)Math.Cos(i / 5.0) * 5, RecordedAtUtc = now.AddMinutes(-i) });
        }
        db.Readings.AddRange(readings);
        await db.SaveChangesAsync(ct);
    }
}
