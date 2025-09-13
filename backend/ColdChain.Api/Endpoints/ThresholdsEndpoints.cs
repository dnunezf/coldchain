using ColdChain.Api.Domain.Entities;
using ColdChain.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace ColdChain.Api.Endpoints;

public static class ThresholdsEndpoints
{
    public static void MapThresholds(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/thresholds");

        // List by unit
        g.MapGet("/{unitId:int}", async (AppDbContext db, int unitId) =>
            await db.Thresholds.Where(t => t.RefrigerationUnitId == unitId)
                .AsNoTracking().ToListAsync());

        // Upsert for a unit+metric
        g.MapPut("", async (AppDbContext db, Threshold dto) =>
        {
            var existing = await db.Thresholds
                .FirstOrDefaultAsync(t => t.RefrigerationUnitId == dto.RefrigerationUnitId && t.Metric == dto.Metric);
            if (existing is null)
            {
                db.Thresholds.Add(dto);
            }
            else
            {
                existing.Min = dto.Min;
                existing.Max = dto.Max;
                db.Thresholds.Update(existing);
            }
            await db.SaveChangesAsync();
            return Results.Ok(dto);
        });

        // Delete by id
        g.MapDelete("/{id:int}", async (AppDbContext db, int id) =>
        {
            var th = await db.Thresholds.FindAsync(id);
            if (th is null) return Results.NotFound();
            db.Thresholds.Remove(th);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
