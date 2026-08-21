using KakarikiKai.Application.Common;
using KakarikiKai.Application.Menus;
using KakarikiKai.Infrastructure.Data;
using KakarikiKai.Infrastructure.Tenancy;
using KakarikiKai.Infrastructure.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KakarikiKai.Infrastructure;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddKakarikiKaiInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("KakarikiKai");
        if (string.IsNullOrWhiteSpace(connectionString)) throw new InvalidOperationException("ConnectionStrings__KakarikiKai must be configured with a passwordless Azure SQL connection string.");
        services.AddScoped<ITenantContext, TenantContext>();
        services.AddSingleton<IClock, SystemClock>();
        services.AddDbContext<KakarikiKaiDbContext>(options => options.UseSqlServer(connectionString));
        services.AddScoped<IMenuReadRepository, SqlMenuReadRepository>();
        services.AddScoped<IChefServiceReadRepository, SqlChefServiceReadRepository>();
        return services;
    }
}
