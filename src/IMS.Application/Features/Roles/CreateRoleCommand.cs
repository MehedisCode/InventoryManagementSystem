using FluentValidation;
using IMS.Application.Common;
using IMS.Domain.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Roles;

public class CreateRoleCommand : IRequest<ApiResponse<string>>
{
    public string Name { get; set; } = string.Empty;
}

public class CreateRoleCommandValidator : AbstractValidator<CreateRoleCommand>
{
    public CreateRoleCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
    }
}

public class CreateRoleCommandHandler(RoleManager<IdentityRole> roleManager) : IRequestHandler<CreateRoleCommand, ApiResponse<string>>
{
    public async Task<ApiResponse<string>> Handle(CreateRoleCommand request, CancellationToken cancellationToken)
    {
        if (await roleManager.RoleExistsAsync(request.Name))
            throw new BusinessRuleException("Role already exists.");

        var role = new IdentityRole { Name = request.Name };
        var result = await roleManager.CreateAsync(role);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Failed to create role: {errors}");
        }

        return ApiResponse<string>.SuccessResponse(role.Id, "Role created successfully.");
    }
}

