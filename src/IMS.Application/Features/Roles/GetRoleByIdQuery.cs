using MediatR;
using IMS.Application.Common;
using IMS.Domain.Constants;
using IMS.Domain.Exceptions;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Roles;

public class GetRoleByIdQuery(string id) : IRequest<ApiResponse<RoleDto>>
{
    public string Id { get; set; } = id;
}

public class GetRoleByIdQueryHandler(RoleManager<IdentityRole> roleManager) : IRequestHandler<GetRoleByIdQuery, ApiResponse<RoleDto>>
{
    public async Task<ApiResponse<RoleDto>> Handle(GetRoleByIdQuery request, CancellationToken cancellationToken)
    {
        var role = await roleManager.FindByIdAsync(request.Id);
        if (role == null)
            throw new NotFoundException("Role not found.", "ID");

        var result = new RoleDto
        {
            Id = role.Id,
            Name = role.Name ?? string.Empty,
            UserCount = 0,
            IsSystem = role.Name.IsSystemRole()
        };

        return ApiResponse<RoleDto>.SuccessResponse(result);
    }
}

