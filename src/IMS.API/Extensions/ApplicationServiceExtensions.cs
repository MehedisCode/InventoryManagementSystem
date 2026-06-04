using IMS.Application;
using IMS.Application.Common;
using MediatR;

namespace IMS.API.Extensions;

public static class ApplicationServiceExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Add MediatR and FluentValidation from the Application layer
        services.AddApplicationDi();

        // Register MediatR Pipeline Behavior
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

        return services;
    }
}
