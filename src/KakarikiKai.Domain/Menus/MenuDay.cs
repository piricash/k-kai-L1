using KakarikiKai.Domain.Common;

namespace KakarikiKai.Domain.Menus;

public sealed class MenuDay : TenantEntity
{
    private MenuDay() { }

    public MenuDay(Guid id, string tenantCode, DateOnly serviceDate)
        : base(id, tenantCode)
    {
        if (serviceDate == default) throw new DomainRuleViolation("A service date is required.");
        ServiceDate = serviceDate;
    }

    public DateOnly ServiceDate { get; private set; }

    public Guid? MealId { get; private set; }

    public decimal Price { get; private set; } = 5m;

    public bool Published { get; private set; }

    public bool IsFree => Price == 0m;

    public void Schedule(Guid mealId, decimal price, bool publish)
    {
        if (mealId == Guid.Empty) throw new DomainRuleViolation("A menu day must reference a meal before it can be published.");
        if (price < 0m) throw new DomainRuleViolation("A menu price cannot be negative.");

        MealId = mealId;
        Price = decimal.Round(price, 2, MidpointRounding.AwayFromZero);
        Published = publish;
    }

    public void ClearMeal()
    {
        MealId = null;
        Published = false;
    }
}
