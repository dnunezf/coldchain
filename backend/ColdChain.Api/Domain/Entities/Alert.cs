namespace ColdChain.Api.Domain.Entities;

public enum AlertStatus { Open = 1, Closed = 2 }
public sealed class Alert
{
    public long Id { get; set; }
    public int RefrigerationUnitId { get; set; }
    public RefrigerationUnit RefrigerationUnit { get; set; } = default!;
    public Metric Metric { get; set; }
    public DateTime OpenedAtUtc { get; set; }
    public DateTime? ClosedAtUtc { get; set; }
    public AlertStatus Status { get; set; }
}
