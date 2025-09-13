using ColdChain.Api.Application.Models;

namespace ColdChain.Api.Application.Abstractions;

public interface IJoltClient
{
    Task<IReadOnlyList<JoltReading>> GetLatestAsync(CancellationToken ct = default);
}
