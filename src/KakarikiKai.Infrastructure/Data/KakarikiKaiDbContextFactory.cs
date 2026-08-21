using KakarikiKai.Application.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace KakarikiKai.Infrastructure.Data;

public sealed class KakarikiKaiDbContextFactory : IDesignTimeDbContextFactory<KakarikiKaiDbContext>
{
    public KakarikiKaiDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__KakarikiKai");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException("ConnectionStrings__KakarikiKai must be supplied for EF Core design-time operations.");

        var options = new DbContextOptionsBuilder<KakarikiKaiDbContext>().UseSqlServer(connectionString).Options;
        return new KakarikiKaiDbContext(options, new DesignTimeTenantContext());
    }

    private sealed class DesignTimeTenantContext : ITenantContext
    {
        public string? TenantCode => "design-time";
        public void Set(string tenantCode) { }
        public void Clear() { }
    }
}
