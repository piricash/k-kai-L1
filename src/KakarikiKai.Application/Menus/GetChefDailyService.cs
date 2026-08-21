using MediatR;

namespace KakarikiKai.Application.Menus;

public sealed record GetChefDailyServiceQuery(DateOnly ServiceDate) : IRequest<ChefDailyServiceProjection?>;
public sealed record ChefDailyServiceProjection(DateOnly ServiceDate, string MealName, decimal Price, int BookingCount, IReadOnlyList<BookingProjection> Bookings);
public sealed record BookingProjection(string DisplayName, string RequestedDietaryOptions);

public interface IChefServiceReadRepository
{
    Task<ChefDailyServiceProjection?> GetForDateAsync(DateOnly serviceDate, CancellationToken cancellationToken);
}

public sealed class GetChefDailyServiceQueryHandler(IChefServiceReadRepository service) : IRequestHandler<GetChefDailyServiceQuery, ChefDailyServiceProjection?>
{
    public Task<ChefDailyServiceProjection?> Handle(GetChefDailyServiceQuery request, CancellationToken cancellationToken) => service.GetForDateAsync(request.ServiceDate, cancellationToken);
}
