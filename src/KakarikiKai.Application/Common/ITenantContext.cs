namespace KakarikiKai.Application.Common;

public interface ITenantContext
{
    string? TenantCode { get; }
    void Set(string tenantCode);
    void Clear();
}
