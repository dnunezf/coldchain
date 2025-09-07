using ColdChain.Api.Infrastructure;
using ColdChain.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ColdChain.Api.Endpoints;

public static class UnitsEndpoints
{
    public static void MapUnits(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/units");
        g.MapGet("", async (AppDbContext db) =>
            await db.RefrigerationUnits.AsNoTracking().ToListAsync());
        g.MapPost("", async (AppDbContext db, RefrigerationUnit dto) =>
        {
            db.RefrigerationUnits.Add(dto); await db.SaveChangesAsync();
            return Results.Created($"/api/units/{dto.Id}", dto);
        });
    }
}
