using ColdChain.Api.Application.Models;

namespace ColdChain.Api.Application.Abstractions;

public interface IReadingIngestor
{
    Task IngestAsync(IReadOnlyList<JoltReading> readings, CancellationToken ct = default);
}
