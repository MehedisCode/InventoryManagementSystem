using IMS.Application.Common;
using IMS.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Users;

public class ToggleUserStatusCommand(string id) : IRequest<ApiResponse<bool>>
{
    public string Id { get; set; } = id;
}

public class ToggleUserStatusCommandHandler(UserManager<ApplicationUser> userManager) : IRequestHandler<ToggleUserStatusCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(ToggleUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.Id);
        if (user == null)
            return ApiResponse<bool>.ErrorResponse("User not found.");

        user.IsActive = !user.IsActive;
        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return ApiResponse<bool>.ErrorResponse($"Failed to toggle user status: {errors}");
        }

        return ApiResponse<bool>.SuccessResponse(
            true, $"User {(user.IsActive ? "activated" : "deactivated")} successfully.");
    }
}
