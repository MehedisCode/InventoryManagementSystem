using MediatR;
using FluentValidation;
using IMS.Domain.Entities;
using IMS.Application.Common;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Users;

public class CreateUserCommand : IRequest<ApiResponse<string>>
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
}

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.RoleName).NotEmpty();
    }
}

public class CreateUserCommandHandler(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager) : IRequestHandler<CreateUserCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            return ApiResponse<string>.ErrorResponse("User with this email already exists.");

        if (!await roleManager.RoleExistsAsync(request.RoleName))
            return ApiResponse<string>.ErrorResponse("Specified role does not exist.");

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return ApiResponse<string>.ErrorResponse($"Failed to create user: {errors}");
        }

        await userManager.AddToRoleAsync(user, request.RoleName);

        return ApiResponse<string>.SuccessResponse(user.Id, "User created successfully.");
    }
}
