using IMS.Domain.Exceptions;
using IMS.Application.Common;
using IMS.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Auth.Register;

public class RegisterCommandHandler(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager) : IRequestHandler<RegisterCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var userExists = await userManager.FindByEmailAsync(request.Email);
        if (userExists != null)
            throw new BusinessRuleException("User with this email already exists.");

        var roleExists = await roleManager.RoleExistsAsync(request.RoleName);
        if (!roleExists)
            throw new BusinessRuleException("Invalid role specified.");

        var user = new ApplicationUser
        {
            Email = request.Email,
            UserName = request.Email,
            FullName = request.FullName,
            IsActive = true
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            return ApiResponse<string>.ErrorResponse("User registration failed.", errors);
        }

        await userManager.AddToRoleAsync(user, request.RoleName);

        return ApiResponse<string>.SuccessResponse(user.Id, "User created successfully.");
    }
}
