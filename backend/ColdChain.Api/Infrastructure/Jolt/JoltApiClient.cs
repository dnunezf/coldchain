using System.Net.Http.Json;
using ColdChain.Api.Application.Abstractions;
using ColdChain.Api.Application.Models;
using ColdChain.Api.Infrastructure.Options;
using Microsoft.Extensions.Options;

namespace ColdChain.Api.Infrastructure.Jolt;

public sealed class JoltApiClient : IJoltClient
{
    private readonly IHttpClientFactory _http;
    private readonly JoltOptions _opt;

    public JoltApiClient(IHttpClientFactory http, IOptions<JoltOptions> opt)
    {
        _http = http;
        _opt = opt.Value;
    }

    public async Task<IReadOnlyList<JoltReading>> GetLatestAsync(CancellationToken ct = default)
    {
        using var client = _http.CreateClient();
        client.BaseAddress = new Uri(_opt.BaseUrl);
        if (!string.IsNullOrWhiteSpace(_opt.ApiKey))
            client.DefaultRequestHeaders.Add("Authorization", $"Bearer {_opt.ApiKey}");

        // TODO: replace with the real API path and response shape once Jolt confirms.
        // Example: GET /v1/devices/{id}/readings?since=...
        var since = DateTime.UtcNow.AddMinutes(-2).ToString("O");
        var resp = await client.GetAsync($"/v1/readings?since={Uri.EscapeDataString(since)}", ct);
        resp.EnsureSuccessStatusCode();

        // TODO: map the real JSON response into JoltReading objects.
        var json = await resp.Content.ReadFromJsonAsync<List<JoltReading>>(cancellationToken: ct)
                   ?? new List<JoltReading>();
        return json;
    }
}
