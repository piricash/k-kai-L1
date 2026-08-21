using FluentValidation;
using MediatR;

namespace KakarikiKai.Application.Menus;

public sealed record GetNextWeekMenuQuery(DateOnly WeekCommencing) : IRequest<IReadOnlyList<MenuDayProjection>>;
public sealed record MenuDayProjection(DateOnly ServiceDate, string MealName, string MealDescription, decimal Price, string DietaryConfiguration);

public interface IMenuReadRepository
{
    Task<IReadOnlyList<MenuDayProjection>> GetPublishedWeekAsync(DateOnly weekCommencing, CancellationToken cancellationToken);
}

public sealed class GetNextWeekMenuQueryValidator : AbstractValidator<GetNextWeekMenuQuery>
{
    public GetNextWeekMenuQueryValidator() => RuleFor(query => query.WeekCommencing).NotEqual(default(DateOnly)).WithMessage("A valid week commencement date is required.");
}

public sealed class GetNextWeekMenuQueryHandler(IMenuReadRepository menus) : IRequestHandler<GetNextWeekMenuQuery, IReadOnlyList<MenuDayProjection>>
{
    public Task<IReadOnlyList<MenuDayProjection>> Handle(GetNextWeekMenuQuery request, CancellationToken cancellationToken) => menus.GetPublishedWeekAsync(request.WeekCommencing, cancellationToken);
}
