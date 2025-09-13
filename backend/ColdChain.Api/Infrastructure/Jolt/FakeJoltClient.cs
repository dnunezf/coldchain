using ColdChain.Api.Application.Abstractions;
using ColdChain.Api.Application.Models;
using ColdChain.Api.Domain.Entities;

namespace ColdChain.Api.Infrastructure.Jolt;

public sealed class FakeJoltClient : IJoltClient
{
    private readonly Random _rnd = new();
    public Task<IReadOnlyList<JoltReading>> GetLatestAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        // Two synthetic readings per poll (temp and humidity) for one device
        var list = new List<JoltReading> {
            new() { DeviceExternalId = "DEV-LOCAL-001", SensorType = (int)SensorType.Temperature,
                    Value = -15m + (decimal)(_rnd.NextDouble()*4 - 2), RecordedAtUtc = now },
            new() { DeviceExternalId = "DEV-LOCAL-001", SensorType = (int)SensorType.Humidity,
                    Value = 55m + (decimal)(_rnd.NextDouble()*8 - 4), RecordedAtUtc = now }
        };
        return Task.FromResult((IReadOnlyList<JoltReading>)list);
    }
}
