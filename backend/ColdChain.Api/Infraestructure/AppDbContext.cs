using ColdChain.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ColdChain.Api.Infrastructure;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<Sensor> Sensors => Set<Sensor>();
    public DbSet<RefrigerationUnit> RefrigerationUnits => Set<RefrigerationUnit>();
    public DbSet<Reading> Readings => Set<Reading>();
    public DbSet<Threshold> Thresholds => Set<Threshold>();
    public DbSet<Alert> Alerts => Set<Alert>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Device>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.ExternalId).IsUnique();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
        });
        b.Entity<Sensor>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Unit).HasMaxLength(8).IsRequired();
            e.HasOne(x => x.Device).WithMany(d => d.Sensors).HasForeignKey(x => x.DeviceId);
        });
        b.Entity<RefrigerationUnit>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Location).HasMaxLength(200).IsRequired();
        });
        b.Entity<Reading>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.SensorId, x.RecordedAtUtc });
            e.Property(x => x.Value).HasColumnType("decimal(9,3)");
            e.HasOne(x => x.Sensor).WithMany(s => s.Readings).HasForeignKey(x => x.SensorId);
        });
        b.Entity<Threshold>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Min).HasColumnType("decimal(9,3)");
            e.Property(x => x.Max).HasColumnType("decimal(9,3)");
            e.HasOne(x => x.RefrigerationUnit).WithMany().HasForeignKey(x => x.RefrigerationUnitId);
            e.HasIndex(x => new { x.RefrigerationUnitId, x.Metric }).IsUnique();
        });
        b.Entity<Alert>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasOne(x => x.RefrigerationUnit).WithMany().HasForeignKey(x => x.RefrigerationUnitId);
            e.HasIndex(x => new { x.RefrigerationUnitId, x.Status, x.OpenedAtUtc });
        });
    }
}
