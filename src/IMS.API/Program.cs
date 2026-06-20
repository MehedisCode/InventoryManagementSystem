using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;
using IMS.Domain.Entities;
using IMS.Infrastructure.Persistence;
using IMS.API.Extensions;
using IMS.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .CreateLogger();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", (policy) =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Host.UseSerilog();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter())
    );

builder.Services.AddInfrastructureServicesApi(builder.Configuration);
builder.Services.AddApplicationServices();

var app = builder.Build();

app.UseMiddleware<GlobalExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

if (!app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseCors("ReactPolicy");

app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

    var roles = new[] { "Admin", "Manager", "Staff" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    async Task EnsureDemoUserAsync(string email, string fullName, string password, string role)
    {
        if (await userManager.FindByEmailAsync(email) != null)
        {
            Log.Information("Demo user {Email} already exists, skipping", email);
            return;
        }
        var u = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };
        var result = await userManager.CreateAsync(u, password);
        if (!result.Succeeded)
        {
            Log.Warning("Failed to seed demo user {Email}: {Errors}", email, string.Join("; ", result.Errors));
            return;
        }
        await userManager.AddToRoleAsync(u, role);
        Log.Information("Seeded demo user {Email} with role {Role}", email, role);
    }

    await EnsureDemoUserAsync("admin@ims.com", "System Admin", "Admin@123", "Admin");
    await EnsureDemoUserAsync("manager@ims.com", "Demo Manager", "Manager@123", "Manager");
    await EnsureDemoUserAsync("staff@ims.com", "Demo Staff", "Staff@123", "Staff");
}

app.MapControllers();

app.Run();
