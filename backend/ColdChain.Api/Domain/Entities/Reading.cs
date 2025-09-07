namespace ColdChain.Api.Domain.Entities;

public sealed class Reading
{
    public long Id { get; set; }
    public int SensorId { get; set; }
    public Sensor Sensor { get; set; } = default!;
    public decimal Value { get; set; }
    public DateTime RecordedAtUtc { get; set; }
}
