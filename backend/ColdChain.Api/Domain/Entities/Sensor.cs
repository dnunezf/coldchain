namespace ColdChain.Api.Domain.Entities;

public enum SensorType { Temperature = 1, Humidity = 2 }

public sealed class Sensor
{
    public int Id { get; set; }
    public int DeviceId { get; set; }
    public Device Device { get; set; } = default!;
    public SensorType Type { get; set; }
    public string Unit { get; set; } = default!; // "°C" or "%"

    // Relation Sensor -> RefrigerationUnit
    // Sensor.cs
    public int? RefrigerationUnitId { get; set; }           
    public RefrigerationUnit? RefrigerationUnit { get; set; } 

    //
    public ICollection<Reading> Readings { get; set; } = new List<Reading>();
}
