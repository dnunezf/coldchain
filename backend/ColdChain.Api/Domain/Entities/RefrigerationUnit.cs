namespace ColdChain.Api.Domain.Entities;

public sealed class RefrigerationUnit
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Location { get; set; } = default!;
}
