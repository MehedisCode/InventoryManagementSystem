using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Roles;

public class DeleteRoleCommand(string id) : IRequest<ApiResponse<bool>>
{
    public string Id { get; set; } = id;
}

public class DeleteRoleCommandHandler(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager) : IRequestHandler<DeleteRoleCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteRoleCommand request, CancellationToken cancellationToken)
    {
        var role = await roleManager.FindByIdAsync(request.Id);
        if (role == null)
            throw new NotFoundException("Role not found.", "ID");

        if (role.Name is "Admin" or "Manager" or "Staff")
            throw new BusinessRuleException("Cannot delete default system roles.");

        if (role.Name != null)
        {
            var usersInRole = await userManager.GetUsersInRoleAsync(role.Name);
            if (usersInRole.Any())
                throw new BusinessRuleException("Cannot delete role that has assigned users.");
        }

        var result = await roleManager.DeleteAsync(role);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Failed to delete role: {errors}");
        }

        return ApiResponse<bool>.SuccessResponse(true, "Role deleted successfully.");
    }
}

