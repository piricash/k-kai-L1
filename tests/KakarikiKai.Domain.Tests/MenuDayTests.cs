using FluentAssertions;
using KakarikiKai.Domain.Common;
using KakarikiKai.Domain.Menus;

namespace KakarikiKai.Domain.Tests;

public sealed class MenuDayTests
{
    [Fact]
    public void Schedule_with_zero_price_marks_a_day_as_free()
    {
        var menuDay = new MenuDay(Guid.NewGuid(), "org_kakariki", new DateOnly(2026, 8, 25));
        menuDay.Schedule(Guid.NewGuid(), 0m, publish: true);
        menuDay.IsFree.Should().BeTrue();
        menuDay.Published.Should().BeTrue();
    }

    [Fact]
    public void Schedule_rejects_a_negative_price()
    {
        var menuDay = new MenuDay(Guid.NewGuid(), "org_kakariki", new DateOnly(2026, 8, 25));
        var act = () => menuDay.Schedule(Guid.NewGuid(), -0.01m, publish: true);
        act.Should().Throw<DomainRuleViolation>().WithMessage("*cannot be negative*");
    }
}
