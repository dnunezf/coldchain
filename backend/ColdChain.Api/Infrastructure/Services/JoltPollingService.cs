using ColdChain.Api.Application.Abstractions;
using ColdChain.Api.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace ColdChain.Api.Infrastructure.Services;

public sealed class JoltPollingService : BackgroundService
{
    private readonly IJoltClient _client;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _period;

    public JoltPollingService(
        IJoltClient client,
        IServiceScopeFactory scopeFactory,
        IOptions<JoltOptions> options)
    {
        _client = client;
        _scopeFactory = scopeFactory;
        _period = TimeSpan.FromSeconds(Math.Max(5, options.Value.PollSeconds));
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var batch = await _client.GetLatestAsync(stoppingToken);

            using (var scope = _scopeFactory.CreateScope())
            {
                var ingestor = scope.ServiceProvider.GetRequiredService<IReadingIngestor>();
                await ingestor.IngestAsync(batch, stoppingToken);
            }

            await Task.Delay(_period, stoppingToken);
        }
    }
}
