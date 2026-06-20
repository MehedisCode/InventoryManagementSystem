using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Exceptions;
using IMS.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using IMSRoles = IMS.Domain.Constants.Roles;

namespace IMS.Application.Features.Users;

public class DeactivateUserCommand(string id) : IRequest<ApiResponse<bool>>
{
    public string Id { get; set; } = id;
}

public class DeactivateUserCommandHandler(
    UserManager<ApplicationUser> userManager,
    ITransactionScopeFactory transactionScopeFactory) : IRequestHandler<DeactivateUserCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeactivateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.Id);
        if (user == null)
            throw new NotFoundException("User not found.", "ID");

        await using var tx = await transactionScopeFactory.BeginAsync(cancellationToken);

        if (await userManager.IsInRoleAsync(user, IMSRoles.Admin))
        {
            var admins = await userManager.GetUsersInRoleAsync(IMSRoles.Admin);
            if (admins.Count <= 1)
                throw new BusinessRuleException("Cannot deactivate the last Admin user.");
        }

        // Soft delete
        user.IsActive = false;
        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Failed to deactivate user: {errors}");
        }

        await tx.CommitAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "User deactivated successfully.");
    }
}
