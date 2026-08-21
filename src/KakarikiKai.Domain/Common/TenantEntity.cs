namespace KakarikiKai.Domain.Common;

public abstract class TenantEntity
{
    protected TenantEntity(Guid id, string tenantCode)
    {
        if (id == Guid.Empty) throw new DomainRuleViolation("A durable identifier is required.");
        if (string.IsNullOrWhiteSpace(tenantCode)) throw new DomainRuleViolation("A tenant code is required.");

        Id = id;
        TenantCode = tenantCode;
    }

    protected TenantEntity() { }

    public Guid Id { get; private set; }

    public string TenantCode { get; private set; } = string.Empty;
}
