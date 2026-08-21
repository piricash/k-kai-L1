using KakarikiKai.Application.Common;

namespace KakarikiKai.Infrastructure.Tenancy;

public sealed class TenantContext : ITenantContext
{
    public string? TenantCode { get; private set; }
    public void Set(string tenantCode)
    {
        if (string.IsNullOrWhiteSpace(tenantCode)) throw new ArgumentException("A trusted tenant code is required.", nameof(tenantCode));
        TenantCode = tenantCode.Trim();
    }
    public void Clear() => TenantCode = null;
}
