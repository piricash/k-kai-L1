using KakarikiKai.Domain.Common;

namespace KakarikiKai.Domain.Menus;

public sealed class Meal : TenantEntity
{
    private Meal() { }

    public Meal(Guid id, string tenantCode, string name, string description, string dietaryConfiguration)
        : base(id, tenantCode)
    {
        UpdateDetails(name, description, dietaryConfiguration);
    }

    public string Name { get; private set; } = string.Empty;

    public string Description { get; private set; } = string.Empty;

    /// <summary>JSON persisted at the infrastructure boundary; its meaning is owned by the meal aggregate.</summary>
    public string DietaryConfiguration { get; private set; } = "[]";

    public void UpdateDetails(string name, string description, string dietaryConfiguration)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length > 120)
            throw new DomainRuleViolation("A meal name of up to 120 characters is required.");
        if (string.IsNullOrWhiteSpace(description) || description.Trim().Length > 600)
            throw new DomainRuleViolation("A meal description of up to 600 characters is required.");
        if (string.IsNullOrWhiteSpace(dietaryConfiguration))
            throw new DomainRuleViolation("A dietary configuration is required.");

        Name = name.Trim();
        Description = description.Trim();
        DietaryConfiguration = dietaryConfiguration;
    }
}
