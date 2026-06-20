using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Exceptions;
using IMS.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Identity;
using IMSRoles = IMS.Domain.Constants.Roles;

namespace IMS.Application.Features.Users;

public class UpdateUserCommand : IRequest<ApiResponse<bool>>
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.RoleName).NotEmpty();
    }
}

public class UpdateUserCommandHandler(
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    ITransactionScopeFactory transactionScopeFactory)
    : IRequestHandler<UpdateUserCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByIdAsync(request.Id);
        if (user == null)
            throw new NotFoundException("User not found.", "ID");

        if (user.Email != request.Email)
        {
            var existingUser = await userManager.FindByEmailAsync(request.Email);
            if (existingUser != null && existingUser.Id != request.Id)
                throw new BusinessRuleException("Email is already taken by another user.");
        }

        if (!await roleManager.RoleExistsAsync(request.RoleName))
            throw new BusinessRuleException("Specified role does not exist.");

        if (!request.IsActive && user.IsActive
                              && await userManager.IsInRoleAsync(user, IMSRoles.Admin))
        {
            var admins = await userManager.GetUsersInRoleAsync(IMSRoles.Admin);
            var activeAdmins = admins.Count(a => a.IsActive);
            if (activeAdmins <= 1)
                throw new BusinessRuleException("Cannot deactivate the last active Admin user.");
        }

        user.FullName = request.FullName;
        user.Email = request.Email;
        user.UserName = request.Email;
        user.IsActive = request.IsActive;

        var result = await userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleException($"Failed to update user: {errors}");
        }

        await using var tx = await transactionScopeFactory.BeginAsync(cancellationToken);

        if (await userManager.IsInRoleAsync(user, IMSRoles.Admin) && request.RoleName != IMSRoles.Admin)
        {
            var admins = await userManager.GetUsersInRoleAsync(IMSRoles.Admin);
            if (admins.Count <= 1)
                throw new BusinessRuleException("Cannot demote the last Admin user.");
        }

        var currentRoles = await userManager.GetRolesAsync(user);
        await userManager.RemoveFromRolesAsync(user, currentRoles);
        await userManager.AddToRoleAsync(user, request.RoleName);

        await tx.CommitAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "User updated successfully.");
    }
}

