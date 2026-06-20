using IMS.Application.Common;
using IMS.Domain.Entities;
using IMS.Domain.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Auth.Me;

public record MeQuery(string UserId) : IRequest<ApiResponse<MeResponse>>;

public class MeQueryHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<MeQuery, ApiResponse<MeResponse>>
{
    public async Task<ApiResponse<MeResponse>> Handle(MeQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserId))
            throw new UnauthorizedAccessException("Missing user identifier.");

        var user = await userManager.FindByIdAsync(request.UserId);
        if (user == null)
            throw new NotFoundException("User not found.", "ID");

        var roles = await userManager.GetRolesAsync(user);

        return ApiResponse<MeResponse>.SuccessResponse(new MeResponse
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Role = roles.FirstOrDefault(r => !string.IsNullOrEmpty(r)) ?? string.Empty
        });
    }
}
