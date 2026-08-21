using KakarikiKai.Application.Menus;
using Microsoft.EntityFrameworkCore;

namespace KakarikiKai.Infrastructure.Data;

public sealed class SqlMenuReadRepository(KakarikiKaiDbContext database) : IMenuReadRepository
{
    public async Task<IReadOnlyList<MenuDayProjection>> GetPublishedWeekAsync(DateOnly weekCommencing, CancellationToken cancellationToken)
    {
        var weekEnd = weekCommencing.AddDays(7);
        return await database.MenuDays.AsNoTracking()
            .Where(day => day.Published && day.MealId != null && day.ServiceDate >= weekCommencing && day.ServiceDate < weekEnd)
            .Join(database.Meals.AsNoTracking(), day => day.MealId, meal => meal.Id, (day, meal) => new MenuDayProjection(day.ServiceDate, meal.Name, meal.Description, day.Price, meal.DietaryConfiguration))
            .OrderBy(day => day.ServiceDate)
            .ToListAsync(cancellationToken);
    }
}

public sealed class SqlChefServiceReadRepository(KakarikiKaiDbContext database) : IChefServiceReadRepository
{
    public async Task<ChefDailyServiceProjection?> GetForDateAsync(DateOnly serviceDate, CancellationToken cancellationToken)
    {
        var menuDay = await database.MenuDays.AsNoTracking()
            .Where(day => day.ServiceDate == serviceDate && day.MealId != null)
            .Join(database.Meals.AsNoTracking(), day => day.MealId, meal => meal.Id, (day, meal) => new { day, meal })
            .SingleOrDefaultAsync(cancellationToken);
        if (menuDay is null) return null;

        var bookings = await database.Bookings.AsNoTracking().Where(booking => booking.MenuDayId == menuDay.day.Id).OrderBy(booking => booking.DisplayName)
            .Select(booking => new BookingProjection(booking.DisplayName, booking.RequestedDietaryOptions)).ToListAsync(cancellationToken);

        return new ChefDailyServiceProjection(menuDay.day.ServiceDate, menuDay.meal.Name, menuDay.day.Price, bookings.Count, bookings);
    }
}
