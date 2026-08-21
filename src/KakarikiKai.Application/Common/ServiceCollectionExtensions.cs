using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace KakarikiKai.Application.Common;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddKakarikiKaiApplication(this IServiceCollection services)
    {
        services.AddMediatR(configuration => configuration.RegisterServicesFromAssembly(typeof(ServiceCollectionExtensions).Assembly));
        services.AddValidatorsFromAssembly(typeof(ServiceCollectionExtensions).Assembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        return services;
    }
}
