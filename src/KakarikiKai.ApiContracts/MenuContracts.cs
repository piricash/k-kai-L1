namespace KakarikiKai.ApiContracts;

public sealed record MenuDayResponse(DateOnly ServiceDate, string MealName, string MealDescription, decimal Price, bool IsFree, string DietaryConfiguration);
public sealed record WeeklyMenuResponse(DateOnly WeekCommencing, IReadOnlyList<MenuDayResponse> Days);
public sealed record ChefDailyServiceResponse(DateOnly ServiceDate, string MealName, decimal Price, bool IsFree, int BookingCount, IReadOnlyList<ChefBookingResponse> Bookings);
public sealed record ChefBookingResponse(string DisplayName, string RequestedDietaryOptions);
