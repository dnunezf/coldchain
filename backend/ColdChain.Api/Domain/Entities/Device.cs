namespace ColdChain.Api.Domain.Entities;

public sealed class Device
{
    public int Id { get; set; }
    public string ExternalId { get; set; } = default!;
    public string Name { get; set; } = default!;
    public ICollection<Sensor> Sensors { get; set; } = new List<Sensor>();
}
