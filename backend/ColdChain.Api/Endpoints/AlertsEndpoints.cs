using ColdChain.Api.Domain.Entities;
using ColdChain.Api.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace ColdChain.Api.Endpoints;

public static class AlertsEndpoints
{
    public static void MapAlerts(this IEndpointRouteBuilder app)
    {
        var g = app.MapGroup("/api/alerts");

        g.MapGet("", async (AppDbContext db, int unitId, int? status) =>
        {
            IQueryable<Alert> q = db.Alerts.AsNoTracking().Where(a => a.RefrigerationUnitId == unitId);
            if (status is not null) q = q.Where(a => a.Status == (AlertStatus)status);
            return await q
                .OrderByDescending(a => a.OpenedAtUtc)
                .Select(a => new
                {
                    id = a.Id,
                    metric = a.Metric,
                    openedAtUtc = a.OpenedAtUtc,
                    closedAtUtc = a.ClosedAtUtc,
                    status = a.Status
                })
                .ToListAsync();
        });
    }
}
