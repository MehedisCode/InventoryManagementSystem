using System.Security.Claims;
using System.Text;
using IMS.Application.Constants;
using IMS.Application.Interfaces;
using IMS.Domain.Constants;
using IMS.Infrastructure;
using IMS.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace IMS.API.Extensions;

public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructureServicesApi(this IServiceCollection services, IConfiguration config)
    {
        services.AddInfrastructureServices(config);

        services.AddScoped<IUserTokenValidator, UserTokenValidator>();

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter JWT like: Bearer {your token}"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        var jwtSettings = config.GetSection("JwtSettings");
        var secretKey = jwtSettings["Secret"] ?? throw new InvalidOperationException("JwtSettings:Secret is missing");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
            };

            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = async context =>
                {
                    var userId = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                    var validator = context.HttpContext.RequestServices.GetRequiredService<IUserTokenValidator>();
                    var result = await validator.ValidateAsync(userId ?? string.Empty, context.HttpContext.RequestAborted);
                    if (!result.IsValid)
                        context.Fail(result.Reason ?? "Authentication failed.");
                }
            };
        });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(Policies.CanWriteInventory, p => p.RequireRole(Roles.Admin, Roles.Manager));
            options.AddPolicy(Policies.CanTransition, p => p.RequireRole(Roles.Admin, Roles.Manager));
            options.AddPolicy(Policies.AdminOnly, p => p.RequireRole(Roles.Admin));
        });

        return services;
    }
}
