using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace IMS.Infrastructure.Services;

public class UserTokenValidator(
    UserManager<ApplicationUser> userManager,
    ILogger<UserTokenValidator> logger) : IUserTokenValidator
{
    public async Task<TokenValidationResult> ValidateAsync(string userId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return TokenValidationResult.Failure("Missing user identifier.");

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            logger.LogInformation("JWT validation: user {UserId} not found", userId);
            return TokenValidationResult.Failure("User not found.");
        }

        if (!user.IsActive)
        {
            logger.LogInformation("JWT validation: user {UserId} is inactive", userId);
            return TokenValidationResult.Failure("Account is inactive.");
        }

        return TokenValidationResult.Success();
    }
}
