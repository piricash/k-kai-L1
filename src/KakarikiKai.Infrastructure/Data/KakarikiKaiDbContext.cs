using KakarikiKai.Application.Common;
using KakarikiKai.Domain.Bookings;
using KakarikiKai.Domain.Menus;
using Microsoft.EntityFrameworkCore;

namespace KakarikiKai.Infrastructure.Data;

public sealed class KakarikiKaiDbContext(DbContextOptions<KakarikiKaiDbContext> options, ITenantContext tenantContext) : DbContext(options)
{
    private readonly ITenantContext _tenantContext = tenantContext;
    public DbSet<Meal> Meals => Set<Meal>();
    public DbSet<MenuDay> MenuDays => Set<MenuDay>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Meal>(entity =>
        {
            entity.ToTable("Meals"); entity.HasKey(meal => meal.Id);
            entity.Property(meal => meal.TenantCode).HasMaxLength(100).IsRequired(); entity.Property(meal => meal.Name).HasMaxLength(120).IsRequired(); entity.Property(meal => meal.Description).HasMaxLength(600).IsRequired(); entity.Property(meal => meal.DietaryConfiguration).IsRequired();
            entity.HasIndex(meal => new { meal.TenantCode, meal.Name }).IsUnique();
            entity.HasQueryFilter(meal => _tenantContext.TenantCode != null && meal.TenantCode == _tenantContext.TenantCode);
        });
        modelBuilder.Entity<MenuDay>(entity =>
        {
            entity.ToTable("MenuDays"); entity.HasKey(day => day.Id); entity.Property(day => day.TenantCode).HasMaxLength(100).IsRequired(); entity.Property(day => day.Price).HasPrecision(9, 2);
            entity.HasIndex(day => new { day.TenantCode, day.ServiceDate }).IsUnique(); entity.HasOne<Meal>().WithMany().HasForeignKey(day => day.MealId).OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(day => _tenantContext.TenantCode != null && day.TenantCode == _tenantContext.TenantCode);
        });
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.ToTable("Bookings"); entity.HasKey(booking => booking.Id); entity.Property(booking => booking.TenantCode).HasMaxLength(100).IsRequired(); entity.Property(booking => booking.ActorSubject).HasMaxLength(160).IsRequired(); entity.Property(booking => booking.DisplayName).HasMaxLength(160).IsRequired(); entity.Property(booking => booking.RequestedDietaryOptions).IsRequired();
            entity.HasIndex(booking => new { booking.TenantCode, booking.MenuDayId, booking.ActorSubject }).IsUnique(); entity.HasOne<MenuDay>().WithMany().HasForeignKey(booking => booking.MenuDayId).OnDelete(DeleteBehavior.Restrict);
            entity.HasQueryFilter(booking => _tenantContext.TenantCode != null && booking.TenantCode == _tenantContext.TenantCode);
        });
    }
}
