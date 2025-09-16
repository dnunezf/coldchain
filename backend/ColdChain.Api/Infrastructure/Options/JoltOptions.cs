namespace ColdChain.Api.Infrastructure.Options;

public sealed class JoltOptions
{
    public string Mode { get; set; } = "Fake";
    public string BaseUrl { get; set; } = "";
    public string ApiKey { get; set; } = "";
    public int PollSeconds { get; set; } = 60;
    public string WebhookSecret { get; set; } = "";
}
