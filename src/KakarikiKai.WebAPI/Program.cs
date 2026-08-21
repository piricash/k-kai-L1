using KakarikiKai.ApiContracts;
using KakarikiKai.Application.Common;
using KakarikiKai.Application.Menus;
using KakarikiKai.Infrastructure;
using KakarikiKai.WebAPI.Security;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);
var kindeAuthority = builder.Configuration["Kinde:Authority"];
var kindeAudience = builder.Configuration["Kinde:Audience"];
if (string.IsNullOrWhiteSpace(kindeAuthority) || kindeAuthority.Contains("YOUR_", StringComparison.Ordinal) || string.IsNullOrWhiteSpace(kindeAudience) || kindeAudience.Contains("YOUR_", StringComparison.Ordinal))
    throw new InvalidOperationException("Kinde__Authority and Kinde__Audience must be configured before the API can start.");

builder.Services.AddKakarikiKaiApplication();
builder.Services.AddKakarikiKaiInfrastructure(builder.Configuration);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.Authority = kindeAuthority;
    options.Audience = kindeAudience;
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new TokenValidationParameters { NameClaimType = "sub", ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true, ValidateIssuerSigningKey = true };
});
builder.Services.AddSingleton<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("KaimahiRead", policy => policy.RequireAuthenticatedUser().RequireClaim("org_code"));
    options.AddPolicy("KaiChefMenu", policy => policy.RequireAuthenticatedUser().RequireClaim("org_code").AddRequirements(new PermissionRequirement("kaiMenu:manage")));
    options.AddPolicy("KaiChefBookings", policy => policy.RequireAuthenticatedUser().RequireClaim("org_code").AddRequirements(new PermissionRequirement("kaiBookings:view")));
});
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddPolicy("KakarikiClient", policy => { if (allowedOrigins.Length > 0) policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod(); }));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("KindeBearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "Kinde access token for the configured API audience.",
    });
});

var app = builder.Build();
app.UseExceptionHandler(exceptionApp => exceptionApp.Run(async context => { context.Response.StatusCode = StatusCodes.Status500InternalServerError; await context.Response.WriteAsJsonAsync(new { code = "unexpected_error", message = "The request could not be completed." }); }));
app.UseHttpsRedirection();
app.UseCors("KakarikiClient");
app.UseAuthentication();
app.UseMiddleware<TenantContextMiddleware>();
app.UseAuthorization();
app.UseSwagger();
app.UseSwaggerUI();
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "kakariki-kai-api" })).AllowAnonymous();

app.MapGet("/api/v1/menu/next-week", async (DateOnly? weekCommencing, ISender sender, IClock clock, CancellationToken cancellationToken) =>
{
    var date = weekCommencing ?? NextMonday(DateOnly.FromDateTime(clock.UtcNow.UtcDateTime));
    var days = await sender.Send(new GetNextWeekMenuQuery(date), cancellationToken);
    var responseDays = days.Select(day => day.Adapt<MenuDayResponse>() with { IsFree = day.Price == 0m }).ToArray();
    return Results.Ok(new WeeklyMenuResponse(date, responseDays));
}).RequireAuthorization("KaimahiRead").WithName("GetNextWeekMenu").Produces<WeeklyMenuResponse>();

app.MapGet("/api/v1/chef/daily-service/{serviceDate:datetime}", async (DateOnly serviceDate, ISender sender, CancellationToken cancellationToken) =>
{
    var service = await sender.Send(new GetChefDailyServiceQuery(serviceDate), cancellationToken);
    if (service is null) return Results.NotFound(new { code = "service_day_not_found", message = "No scheduled service day exists for that date." });
    var bookings = service.Bookings.Select(booking => booking.Adapt<ChefBookingResponse>()).ToArray();
    return Results.Ok(new ChefDailyServiceResponse(service.ServiceDate, service.MealName, service.Price, service.Price == 0m, service.BookingCount, bookings));
}).RequireAuthorization("KaiChefBookings").WithName("GetChefDailyService").Produces<ChefDailyServiceResponse>();

app.Run();

static DateOnly NextMonday(DateOnly date)
{
    var daysUntilMonday = ((int)DayOfWeek.Monday - (int)date.DayOfWeek + 7) % 7;
    return date.AddDays(daysUntilMonday == 0 ? 7 : daysUntilMonday);
}
