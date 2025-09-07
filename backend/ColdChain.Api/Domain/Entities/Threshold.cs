namespace ColdChain.Api.Domain.Entities;

public enum Metric { Temperature = 1, Humidity = 2 }
public sealed class Threshold
{
    public int Id { get; set; }
    public int RefrigerationUnitId { get; set; }
    public RefrigerationUnit RefrigerationUnit { get; set; } = default!;
    public Metric Metric { get; set; }
    public decimal Min { get; set; }
    public decimal Max { get; set; }
}
