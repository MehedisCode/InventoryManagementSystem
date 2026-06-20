using FluentValidation;
using IMS.Application.Common;
using IMS.Domain.Constants;
using IMS.Domain.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Roles;

public class UpdateRoleCommand : IRequest<ApiResponse<bool>>
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public class UpdateRoleCommandValidator : AbstractValidator<UpdateRoleCommand>
{
    public UpdateRoleCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(50);
    }
}

public class UpdateRoleCommandHandler(RoleManager<IdentityRole> roleManager) : IRequestHandler<UpdateRoleCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await roleManager.FindByIdAsync(request.Id);
        if (role == null)
            throw new NotFoundException("Role not found.", "ID");

        if (role.Name.IsSystemRole())
            throw new BusinessRuleException("Cannot update default system roles.");

        if (await roleManager.RoleExistsAsync(request.Name) && role.Name != request.Name)
            throw new BusinessRuleException("Role name already exists.");

        role.Name = request.Name;
        var result = await roleManager.UpdateAsync(role);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Failed to update role: {errors}");
        }

        return ApiResponse<bool>.SuccessResponse(true, "Role updated successfully.");
    }
}

