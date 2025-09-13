namespace ColdChain.Api.Infrastructure.Options;

public sealed class JoltOptions
{
    public string BaseUrl { get; set; } = default!;
    public string ApiKey { get; set; } = default!;
    public int PollSeconds { get; set; } = 60;
}
