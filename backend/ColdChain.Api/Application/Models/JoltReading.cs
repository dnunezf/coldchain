namespace ColdChain.Api.Application.Models;

public sealed class JoltReading
{
    public string DeviceExternalId { get; set; } = default!;
    public int SensorType { get; set; } // 1=Temperature, 2=Humidity
    public decimal Value { get; set; }
    public DateTime RecordedAtUtc { get; set; }
}
