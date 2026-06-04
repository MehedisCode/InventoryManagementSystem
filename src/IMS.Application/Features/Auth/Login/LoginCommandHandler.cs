using IMS.Application.Common;
using IMS.Application.Interfaces;
using IMS.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using IMS.Domain.Exceptions;
using MediatR;

namespace IMS.Application.Features.Auth.Login;

public class LoginCommandHandler(UserManager<ApplicationUser> userManager, IJwtService jwtService)
    : IRequestHandler<LoginCommand, ApiResponse<LoginResponse>>
{
    public async Task<ApiResponse<LoginResponse>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new BusinessRuleException("Invalid credentials.");

        var isPasswordValid = await userManager.CheckPasswordAsync(user, request.Password);

        if (!isPasswordValid)
            throw new BusinessRuleException("Invalid credentials.");

        var roles = await userManager.GetRolesAsync(user);
        var token = jwtService.GenerateToken(user, roles);

        var response = new LoginResponse
        {
            Token = token,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName
        };

        return ApiResponse<LoginResponse>.SuccessResponse(response, "Login successful.");
    }
}


