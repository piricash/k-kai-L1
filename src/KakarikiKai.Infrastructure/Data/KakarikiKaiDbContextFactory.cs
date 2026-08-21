using KakarikiKai.Application.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace KakarikiKai.Infrastructure.Data;

public sealed class KakarikiKaiDbContextFactory : IDesignTimeDbContextFactory<KakarikiKaiDbContext>
{
    public KakarikiKaiDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<KakarikiKaiDbContext>().UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=KakarikiKaiDesign;Trusted_Connection=True;TrustServerCertificate=True;").Options;
        return new KakarikiKaiDbContext(options, new DesignTimeTenantContext());
    }

    private sealed class DesignTimeTenantContext : ITenantContext
    {
        public string? TenantCode => "design-time";
        public void Set(string tenantCode) { }
        public void Clear() { }
    }
}
