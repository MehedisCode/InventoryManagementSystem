using MediatR;
using IMS.Domain.Entities;
using IMS.Domain.Constants;
using IMS.Application.Common;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Roles;

public class GetAllRolesQuery : IRequest<ApiResponse<List<RoleDto>>>;

public class GetAllRolesQueryHandler(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager) : IRequestHandler<GetAllRolesQuery, ApiResponse<List<RoleDto>>>
{
    public async Task<ApiResponse<List<RoleDto>>> Handle(GetAllRolesQuery request, CancellationToken cancellationToken)
    {
        var roles = roleManager.Roles.ToList();
        var result = new List<RoleDto>();

        foreach (var role in roles)
        {
            int userCount = 0;
            if (role.Name != null)
            {
                var users = await userManager.GetUsersInRoleAsync(role.Name);
                userCount = users.Count;
            }

            result.Add(new RoleDto
            {
                Id = role.Id,
                Name = role.Name ?? string.Empty,
                UserCount = userCount,
                IsSystem = role.Name.IsSystemRole()
            });
        }

        return ApiResponse<List<RoleDto>>.SuccessResponse(result);
    }
}

