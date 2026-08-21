using KakarikiKai.Domain.Common;

namespace KakarikiKai.Domain.Bookings;

public sealed class Booking : TenantEntity
{
    private Booking() { }

    public Booking(Guid id, string tenantCode, Guid menuDayId, string actorSubject, string displayName, string requestedDietaryOptions)
        : base(id, tenantCode)
    {
        if (menuDayId == Guid.Empty) throw new DomainRuleViolation("A booking must belong to a menu day.");
        if (string.IsNullOrWhiteSpace(actorSubject)) throw new DomainRuleViolation("A booking actor is required.");
        if (string.IsNullOrWhiteSpace(displayName)) throw new DomainRuleViolation("A booking name is required.");

        MenuDayId = menuDayId;
        ActorSubject = actorSubject.Trim();
        DisplayName = displayName.Trim();
        RequestedDietaryOptions = string.IsNullOrWhiteSpace(requestedDietaryOptions) ? "[]" : requestedDietaryOptions;
    }

    public Guid MenuDayId { get; private set; }

    public string ActorSubject { get; private set; } = string.Empty;

    public string DisplayName { get; private set; } = string.Empty;

    public string RequestedDietaryOptions { get; private set; } = "[]";
}
