using IMS.Application.Common;
using IMS.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace IMS.Application.Features.Users;

public class DeleteUserCommand(string id) : IRequest<ApiResponse<bool>>
{
    public string Id { get; set; } = id;
}

public class DeleteUserCommandHandler(UserManager<ApplicationUser> userManager) : IRequestHandler<DeleteUserCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.Id);
        if (user == null)
            return ApiResponse<bool>.ErrorResponse("User not found.");

        if (await userManager.IsInRoleAsync(user, "Admin"))
        {
            var admins = await userManager.GetUsersInRoleAsync("Admin");
            if (admins.Count <= 1)
                return ApiResponse<bool>.ErrorResponse("Cannot delete the last Admin user.");
        }

        // Soft delete
        user.IsActive = false;
        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return ApiResponse<bool>.ErrorResponse($"Failed to delete user: {errors}");
        }

        return ApiResponse<bool>.SuccessResponse(true, "User deactivated successfully.");
    }
}
