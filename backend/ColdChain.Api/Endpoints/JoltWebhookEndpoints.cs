using ColdChain.Api.Application.Abstractions;
using ColdChain.Api.Application.Models;
using ColdChain.Api.Infrastructure.Options;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace ColdChain.Api.Endpoints;

public static class JoltWebhookEndpoints
{
    public static void MapJoltWebhook(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/jolt/webhook",
            async ([FromServices] IReadingIngestor ingestor,
                   [FromServices] IOptions<JoltOptions> opt,
                   HttpRequest req, [FromBody] List<JoltReading> payload,
                   CancellationToken ct) =>
            {
                // TODO: validate signature: header X-Jolt-Signature with opt.Value.WebhookSecret
                // var sig = req.Headers["X-Jolt-Signature"];
                // VerifyHmac(sig, body, opt.Value.WebhookSecret)

                await ingestor.IngestAsync(payload, ct);
                return Results.Ok(new { accepted = payload.Count });
            });
    }
}
