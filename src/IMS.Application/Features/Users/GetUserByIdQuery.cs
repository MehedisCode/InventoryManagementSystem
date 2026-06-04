using IMS.Application.Common;
using IMS.Domain.Exceptions;
using IMS.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Users;

public class GetUserByIdQuery(string id) : IRequest<ApiResponse<UserDetailDto>>
{
    public string Id { get; set; } = id;
}

public class GetUserByIdQueryHandler(UserManager<ApplicationUser> userManager) : IRequestHandler<GetUserByIdQuery, ApiResponse<UserDetailDto>>
{
    public async Task<ApiResponse<UserDetailDto>> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.Id);
        if (user == null)
            throw new NotFoundException("User not found.", "ID");

        var roles = await userManager.GetRolesAsync(user);

        var result = new UserDetailDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            RoleName = roles.FirstOrDefault() ?? string.Empty,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return ApiResponse<UserDetailDto>.SuccessResponse(result);
    }
}

