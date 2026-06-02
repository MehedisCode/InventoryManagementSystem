using IMS.Application.Common;
using IMS.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Users;

public class GetAllUsersQuery : IRequest<ApiResponse<List<UserListDto>>>;

public class GetAllUsersQueryHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<GetAllUsersQuery, ApiResponse<List<UserListDto>>>
{
    public async Task<ApiResponse<List<UserListDto>>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        var users = userManager.Users.ToList();
        var result = new List<UserListDto>();

        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);

            result.Add(new UserListDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                RoleName = roles.FirstOrDefault() ?? string.Empty,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt
            });
        }

        return ApiResponse<List<UserListDto>>.SuccessResponse(result);
    }
}
